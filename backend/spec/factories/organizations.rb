FactoryBot.define do
  factory :organization do
    association :creator, factory: :user
    name          { Faker::Company.name }
    description   { Faker::Lorem.paragraph }
    mission       { Faker::Lorem.sentence }
    category      { :education }
    website       { "https://#{Faker::Internet.domain_name}" }
    contact_email { Faker::Internet.email }
    phone         { Faker::PhoneNumber.phone_number }
    address       { Faker::Address.street_address }
    city          { Faker::Address.city }
    state         { Faker::Address.state_abbr }
    zip           { Faker::Address.zip_code }
    country       { "US" }
    status        { :active }
    verified      { false }
  end
end
