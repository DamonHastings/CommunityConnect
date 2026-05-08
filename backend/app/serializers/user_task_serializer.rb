class UserTaskSerializer
  include JSONAPI::Serializer

  attributes :id, :title, :notes, :due_date, :completed, :completed_at,
             :source_type, :source_id, :created_at
end
