import os
import uuid
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
import psycopg

env_path = os.path.join(os.path.dirname(__file__), 'mock.env')
load_dotenv(env_path)

DSN = os.getenv("PG_CONN")
if not DSN:
    raise RuntimeError("Set PG_CONN in .env")

def random_timestamp(days_back=30):
    now = datetime.now()
    delta = timedelta(days=random.randint(0, days_back), minutes=random.randint(0, 1440))
    return now - delta

def insert_nodes(conn, max_depth, max_branch):
    parent_map = {}

    def recurse(parent_id, depth):
        nid = uuid.uuid4()
        created = random_timestamp()
        updated = created + timedelta(minutes=random.randint(0, 500))
        conn.execute(
            "INSERT INTO nodes (id, title, parent_id, created_at, updated_at) VALUES (%s,%s,%s,%s,%s)",
            (nid, f"Node {nid.hex[:8]}", parent_id, created, updated)
        )
        parent_map[nid] = parent_id
        if depth < max_depth:
            for _ in range(random.randint(1, max_branch)):
                recurse(nid, depth + 1)

    recurse(None, 0)
    return parent_map

def populate_closure(conn, parent_map):
    for nid, parent in parent_map.items():
        ancestors = [nid]
        cur = parent_map.get(nid)
        while cur:
            ancestors.append(cur)
            cur = parent_map.get(cur)
        with conn.cursor() as cur:
            cur.executemany(
                "INSERT INTO node_closure (ancestor_id, descendant_id) VALUES (%s,%s) ON CONFLICT DO NOTHING",
                [(anc, nid) for anc in ancestors]
            )

def insert_documents(conn, num_docs):
    docs = []
    for _ in range(num_docs):
        did = uuid.uuid4()
        created = random_timestamp()
        updated = created + timedelta(minutes=random.randint(0, 500))
        conn.execute(
            "INSERT INTO documents (id, title, description, created_at, updated_at) VALUES (%s,%s,%s,%s,%s)",
            (did, f"Doc {did.hex[:8]}", f"Description {did.hex[:8]}", created, updated)
        )
        docs.append(did)
    return docs

def insert_tags(conn, docs, tags_per_doc):
    for did in docs:
        rows = []
        for _ in range(tags_per_doc):
            tag = f"tag{random.randint(1,20)}"
            created = random_timestamp()
            updated = created + timedelta(minutes=random.randint(0, 500))
            rows.append((did, tag, created, updated))
        with conn.cursor() as cur:
            cur.executemany(
                "INSERT INTO documents_tags (document_id, tag, created_at, updated_at) VALUES (%s,%s,%s,%s) ON CONFLICT DO NOTHING",
                rows
            )

def insert_doc_node_links(conn, docs, node_ids):
    rows = []
    for did in docs:
        for _ in range(random.randint(1,3)):
            nid = random.choice(node_ids)
            created = random_timestamp()
            updated = created + timedelta(minutes=random.randint(0, 500))
            rows.append((did, nid, created, updated))
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO documents_nodes (document_id, node_id, created_at, updated_at) VALUES (%s,%s,%s,%s) ON CONFLICT DO NOTHING",
            rows
        )

def insert_doc_relations(conn, docs):
    rows = []
    for i, d0 in enumerate(docs):
        for d1 in random.sample([d for d in docs if d != d0], random.randint(0, len(docs)-1)):
            created = random_timestamp()
            updated = created + timedelta(minutes=random.randint(0, 500))
            rows.append((d0, d1, 'used_by', created, updated))
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO document_relations (document_id0, document_id1, relation, created_at, updated_at) VALUES (%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING",
            rows
        )

def insert_files_and_links(conn, docs, files_per_doc):
    file_rows = []
    for _ in range(files_per_doc * len(docs)):
        fid = uuid.uuid4()
        created = random_timestamp()
        updated = created + timedelta(minutes=random.randint(0, 500))
        file_rows.append((fid, f"File {fid.hex[:8]}", f"Desc {fid.hex[:8]}", f"bucket{random.randint(1,5)}", f"key{fid.hex[:8]}", created, updated))
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO files (id, title, description, filebucket, filekey, created_at, updated_at) VALUES (%s,%s,%s,%s,%s,%s,%s)",
            file_rows
        )
    file_ids = [row[0] for row in file_rows]

    link_rows = []
    for did in docs:
        for fid in random.sample(file_ids, files_per_doc):
            created = random_timestamp()
            updated = created + timedelta(minutes=random.randint(0, 500))
            link_rows.append((did, fid, created, updated))
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO documents_files (document_id, file_id, created_at, updated_at) VALUES (%s,%s,%s,%s) ON CONFLICT DO NOTHING",
            link_rows
        )

def main():
    max_depth = 3
    max_branch = 3
    num_docs = 50
    tags_per_doc = 3
    files_per_doc = 5

    with psycopg.connect(DSN, autocommit=False) as conn:
        parent_map = insert_nodes(conn, max_depth, max_branch)
        populate_closure(conn, parent_map)
        node_ids = list(parent_map.keys())

        docs = insert_documents(conn, num_docs)
        insert_tags(conn, docs, tags_per_doc)
        insert_doc_node_links(conn, docs, node_ids)
        insert_doc_relations(conn, docs)
        insert_files_and_links(conn, docs, files_per_doc)

        conn.commit()
        print("✅")

if __name__ == "__main__":
    main()
