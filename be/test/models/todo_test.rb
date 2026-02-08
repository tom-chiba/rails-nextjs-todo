require "test_helper"

class TodoTest < ActiveSupport::TestCase
  test "valid with text" do
    todo = Todo.new(text: "Test todo")
    assert todo.valid?
  end

  test "invalid without text" do
    todo = Todo.new(text: nil)
    assert_not todo.valid?
    assert_includes todo.errors[:text], "can't be blank"
  end

  test "invalid with blank text" do
    todo = Todo.new(text: "")
    assert_not todo.valid?
  end

  test "completed defaults to false" do
    todo = Todo.create!(text: "Test todo")
    assert_equal false, todo.completed
  end
end
