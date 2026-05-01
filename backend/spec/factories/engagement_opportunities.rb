FactoryBot.define do
  factory :engagement_opportunity do
    organization { nil }
    title { "MyString" }
    description { "MyText" }
    opportunity_type { 1 }
    status { 1 }
    remote { false }
    start_date { "2026-05-01" }
    end_date { "2026-05-01" }
    requirements { "MyText" }
    contact_email { "MyString" }
  end
end
