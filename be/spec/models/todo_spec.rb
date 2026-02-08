require "rails_helper"

RSpec.describe Todo do
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
