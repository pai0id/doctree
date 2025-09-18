-- +goose Up
-- +goose StatementBegin

CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    parent_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_nodes_node_id FOREIGN KEY (parent_id) REFERENCES nodes (id),
    CONSTRAINT created_at_before CHECK (created_at <= updated_at)
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT created_at_before CHECK (created_at <= updated_at)
);

CREATE TABLE IF NOT EXISTS documents_tags (
    document_id UUID NOT NULL,
    tag TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    PRIMARY KEY (document_id, tag),
    CONSTRAINT fk_documents_tags_document_id FOREIGN KEY (document_id) REFERENCES documents (id),
    CONSTRAINT created_at_before CHECK (created_at <= updated_at)
);

CREATE TABLE IF NOT EXISTS documents_nodes (
    document_id UUID NOT NULL,
    node_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    PRIMARY KEY (document_id, node_id),
    CONSTRAINT fk_documents_nodes_document_id FOREIGN KEY (document_id) REFERENCES documents (id),
    CONSTRAINT fk_documents_nodes_node_id FOREIGN KEY (node_id) REFERENCES nodes (id),
    CONSTRAINT created_at_before CHECK (created_at <= updated_at)
);

CREATE TYPE document_relation AS ENUM (
    'used_by'
);

CREATE TABLE IF NOT EXISTS document_relations (
    document_id0 UUID NOT NULL,
    document_id1 UUID NOT NULL,
    relation document_relation NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    PRIMARY KEY (document_id0, document_id1, relation),
    CONSTRAINT fk_document_relations_document_id0 FOREIGN KEY (document_id0) REFERENCES documents (id),
    CONSTRAINT fk_document_relations_document_id1 FOREIGN KEY (document_id1) REFERENCES documents (id),
    CONSTRAINT created_at_before CHECK (created_at <= updated_at),
    CONSTRAINT no_selfreference CHECK (document_id0 <> document_id1)
);

CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL, -- logical name of the file
    description TEXT,
    filebucket TEXT NOT NULL, -- bucket name
    filekey TEXT NOT NULL, -- key of the file
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT created_at_before CHECK (created_at <= updated_at)
);

CREATE TABLE IF NOT EXISTS documents_files (
    document_id UUID NOT NULL,
    file_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    PRIMARY KEY (document_id, file_id),
    CONSTRAINT fk_documents_files_document_id FOREIGN KEY (document_id) REFERENCES documents (id),
    CONSTRAINT fk_documents_files_file_id FOREIGN KEY (file_id) REFERENCES files (id),
    CONSTRAINT created_at_before CHECK (created_at <= updated_at)
);

CREATE TABLE IF NOT EXISTS parsed_files (
    file_id UUID PRIMARY KEY,
    text TEXT NOT NULL,
    parsed_percentage FLOAT,
    parsed_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_parsed_files_file_id FOREIGN KEY (file_id) REFERENCES files (id),
    CONSTRAINT created_at_before CHECK (created_at <= updated_at)
);


-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS documents_files;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS document_relations;
DROP TABLE IF EXISTS documents_nodes;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS nodes;
DROP TYPE IF EXISTS document_relation;

-- +goose StatementEnd