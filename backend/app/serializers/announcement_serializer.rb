class AnnouncementSerializer
  include JSONAPI::Serializer
  attributes :id, :title, :body, :published_at, :created_at
end
