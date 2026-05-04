class MessageSerializer
  include JSONAPI::Serializer

  attributes :body, :created_at

  attribute :sender do |m|
    { id: m.sender_id, name: m.sender.full_name }
  end
end
