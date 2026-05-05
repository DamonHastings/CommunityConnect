class NotificationSerializer
  include JSONAPI::Serializer

  attributes :notification_type, :title, :body, :url, :actor_name, :read_at, :created_at
end
