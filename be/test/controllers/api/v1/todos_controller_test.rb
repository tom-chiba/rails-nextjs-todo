require "test_helper"

class Api::V1::TodosControllerTest < ActionDispatch::IntegrationTest
  setup do
    @todo = todos(:buy_milk)
  end

  test "index returns all todos" do
    get api_v1_todos_url
    assert_response :success

    json = response.parsed_body
    assert_equal Todo.count, json.size
  end

  test "index returns todos ordered by created_at desc" do
    get api_v1_todos_url
    assert_response :success

    json = response.parsed_body
    timestamps = json.map { |t| t["created_at"] }
    assert_equal timestamps, timestamps.sort.reverse
  end

  test "create with valid params" do
    assert_difference("Todo.count", 1) do
      post api_v1_todos_url, params: { todo: { text: "New todo" } }, as: :json
    end

    assert_response :created

    json = response.parsed_body
    assert_equal "New todo", json["text"]
    assert_equal false, json["completed"]
  end

  test "create with invalid params returns errors" do
    assert_no_difference("Todo.count") do
      post api_v1_todos_url, params: { todo: { text: "" } }, as: :json
    end

    assert_response :unprocessable_entity
  end

  test "update toggles completed" do
    patch api_v1_todo_url(@todo), params: { todo: { completed: true } }, as: :json
    assert_response :success

    json = response.parsed_body
    assert_equal true, json["completed"]
    assert_equal true, @todo.reload.completed
  end

  test "update changes text" do
    patch api_v1_todo_url(@todo), params: { todo: { text: "Updated text" } }, as: :json
    assert_response :success

    assert_equal "Updated text", @todo.reload.text
  end

  test "destroy removes todo" do
    assert_difference("Todo.count", -1) do
      delete api_v1_todo_url(@todo), as: :json
    end

    assert_response :no_content
  end

  test "update nonexistent todo returns not found" do
    patch api_v1_todo_url(id: 999999), params: { todo: { completed: true } }, as: :json
    assert_response :not_found
  end
end
