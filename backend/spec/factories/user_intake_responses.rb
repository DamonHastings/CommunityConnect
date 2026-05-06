FactoryBot.define do
  factory :user_intake_response do
    association :user
    housing_status    { :stable }
    employment_status { :employed_full_time }
    needs_categories  { ["food_nutrition"] }
    urgency           { :ongoing }
    preferred_contact { "email" }
  end
end
