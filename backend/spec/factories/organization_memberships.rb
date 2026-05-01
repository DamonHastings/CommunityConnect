FactoryBot.define do
  factory :organization_membership do
    association :user
    association :organization
    role      { :member }
    joined_at { Time.current }
  end
end
