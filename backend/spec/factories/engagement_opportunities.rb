FactoryBot.define do
  factory :engagement_opportunity do
    association :organization
    title            { Faker::Lorem.sentence(word_count: 4) }
    description      { Faker::Lorem.paragraph }
    opportunity_type { :volunteer }
    status           { :open }
    remote           { false }
    start_date       { Date.current + 1.week }
    end_date         { Date.current + 2.weeks }
    requirements     { Faker::Lorem.sentence }
    contact_email    { Faker::Internet.email }
  end
end
