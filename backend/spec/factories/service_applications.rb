FactoryBot.define do
  factory :service_application do
    association :user
    association :engagement_opportunity
    status  { :pending }
    message { Faker::Lorem.sentence }
  end
end
