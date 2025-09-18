-- +goose Up
-- +goose StatementBegin

CREATE TABLE IF NOT EXISTS node_closure (
    ancestor_id UUID,
    descendant_id UUID,


    PRIMARY KEY (descendant_id, ancestor_id),
    CONSTRAINT fk_ancestor_node_id FOREIGN KEY (ancestor_id) REFERENCES nodes (id),
    CONSTRAINT fk_descendant_node_id FOREIGN KEY (descendant_id) REFERENCES nodes (id)
)


-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE node_closure;

-- +goose StatementEnd

