require "rails_helper"

RSpec.describe Todo do
  describe "associations" do
    it "belongs to a user" do
      todo = create(:todo)
      expect(todo.user).to be_a(User)
    end

    it "is invalid without a user" do
      todo = build(:todo, user: nil)
      expect(todo).not_to be_valid
      expect(todo.errors[:user]).to include("must exist")
    end
  end

  describe "validations" do
    it "is valid with text" do
      todo = build(:todo)
      expect(todo).to be_valid
    end

    it "is invalid without text" do
      todo = build(:todo, text: nil)
      expect(todo).not_to be_valid
      expect(todo.errors[:text]).to include("can't be blank")
    end

    it "is invalid with blank text" do
      todo = build(:todo, text: "")
      expect(todo).not_to be_valid
    end
  end

  describe "defaults" do
    it "defaults completed to false" do
      todo = create(:todo)
      expect(todo.completed).to be false
    end
  end
end
