FactoryBot.define do
  factory :todo do
    text { "Buy milk" }
    completed { false }

    trait :completed do
      completed { true }
    end
  end
end
