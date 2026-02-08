class Todo < ApplicationRecord
  validates :text, presence: true
end
