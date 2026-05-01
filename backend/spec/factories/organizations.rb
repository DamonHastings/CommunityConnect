FactoryBot.define do
  factory :organization do
    name { "MyString" }
    description { "MyText" }
    mission { "MyText" }
    category { 1 }
    website { "MyString" }
    contact_email { "MyString" }
    phone { "MyString" }
    address { "MyString" }
    city { "MyString" }
    state { "MyString" }
    zip { "MyString" }
    country { "MyString" }
    latitude { 1.5 }
    longitude { 1.5 }
    status { 1 }
    verified { false }
  end
end
