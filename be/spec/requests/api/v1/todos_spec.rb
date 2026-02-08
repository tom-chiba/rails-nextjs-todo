require "rails_helper"

RSpec.describe "Api::V1::Todos" do
  describe "GET /api/v1/todos" do
    it "returns all todos" do
      create_list(:todo, 3)

      get api_v1_todos_path
      expect(response).to have_http_status(:ok)

      json = response.parsed_body
      expect(json.size).to eq(3)
    end

    it "returns todos ordered by created_at desc" do
      create(:todo, text: "First")
      create(:todo, text: "Second")

      get api_v1_todos_path

      json = response.parsed_body
      timestamps = json.map { |t| t["created_at"] }
      expect(timestamps).to eq(timestamps.sort.reverse)
    end
  end

  describe "POST /api/v1/todos" do
    it "creates a todo with valid params" do
      expect {
        post api_v1_todos_path, params: { todo: { text: "New todo" } }, as: :json
      }.to change(Todo, :count).by(1)

      expect(response).to have_http_status(:created)

      json = response.parsed_body
      expect(json["text"]).to eq("New todo")
      expect(json["completed"]).to be false
    end

    it "returns errors with invalid params" do
      expect {
        post api_v1_todos_path, params: { todo: { text: "" } }, as: :json
      }.not_to change(Todo, :count)

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH /api/v1/todos/:id" do
    let(:todo) { create(:todo) }

    it "toggles completed" do
      patch api_v1_todo_path(todo), params: { todo: { completed: true } }, as: :json
      expect(response).to have_http_status(:ok)

      json = response.parsed_body
      expect(json["completed"]).to be true
      expect(todo.reload.completed).to be true
    end

    it "changes text" do
      patch api_v1_todo_path(todo), params: { todo: { text: "Updated text" } }, as: :json
      expect(response).to have_http_status(:ok)

      expect(todo.reload.text).to eq("Updated text")
    end

    it "returns not found for nonexistent todo" do
      patch api_v1_todo_path(id: 999999), params: { todo: { completed: true } }, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/todos/:id" do
    it "destroys the todo" do
      todo = create(:todo)

      expect {
        delete api_v1_todo_path(todo), as: :json
      }.to change(Todo, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
