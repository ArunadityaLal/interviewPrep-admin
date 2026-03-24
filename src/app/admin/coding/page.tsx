'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const EMPTY_FORM = {
  title: '',
  slug: '',
  description: '',
  difficulty: 'EASY',
  category: 'Arrays',
  tags: '',
  constraints: '',
  hints: '',
  orderIndex: 0,
  examples: '[{"input":"","output":"","explanation":""}]',
  testCases: '[{"input":"","expectedOutput":"","isHidden":false}]',
  starterCode: '{"cpp":"// Write your solution here","c":"// Write your solution here","sql":"-- Write your SQL query here"}',
  solution: '',
};

export default function AdminCodingPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchQuestions = async () => {
    const response = await fetch('/api/coding/questions');
    const data = await response.json();
    setQuestions(data.questions || []);
  };

  useEffect(() => {
    void fetchQuestions();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingSlug(null);
    setShowForm(false);
  };

  const handleEdit = async (slug: string) => {
    const response = await fetch(`/api/coding/questions/${slug}?admin=true`);
    const data = await response.json();
    const question = data.question;
    setForm({
      title: question.title,
      slug: question.slug,
      description: question.description,
      difficulty: question.difficulty,
      category: question.category,
      tags: (question.tags || []).join(', '),
      constraints: question.constraints || '',
      hints: (question.hints || []).join('\n'),
      orderIndex: question.orderIndex || 0,
      examples: JSON.stringify(question.examples || [], null, 2),
      testCases: JSON.stringify(question.testCases || [], null, 2),
      starterCode: JSON.stringify(question.starterCode || {}, null, 2),
      solution: question.solution || '',
    });
    setEditingSlug(slug);
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      ...form,
      tags: form.tags.split(',').map((value) => value.trim()).filter(Boolean),
      hints: form.hints.split('\n').map((value) => value.trim()).filter(Boolean),
      examples: JSON.parse(form.examples),
      testCases: JSON.parse(form.testCases),
      starterCode: JSON.parse(form.starterCode),
    };

    const response = await fetch(
      editingSlug ? `/api/coding/questions/${editingSlug}` : '/api/coding/questions',
      {
        method: editingSlug ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      setMessage(editingSlug ? 'Question updated.' : 'Question created.');
      resetForm();
      await fetchQuestions();
    } else {
      const data = await response.json();
      setMessage(data.error || 'Failed to save question.');
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Coding Questions</p>
          <h1 className="page-title">Coding Question Bank</h1>
          <p className="page-subtitle">Manage the practice problems available to learners.</p>
        </div>
        <Button onClick={() => setShowForm((current) => !current)}>
          {showForm ? 'Close Form' : 'Add Question'}
        </Button>
      </header>

      {message ? <div className="empty-state">{message}</div> : null}

      {showForm ? (
        <Card variant="elevated">
          <form className="stack" onSubmit={handleSubmit}>
            <input className="field-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" required />
            <input className="field-input" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Slug" required />
            <textarea className="field-input large-textarea" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" required />
            <textarea className="field-input medium-textarea" value={form.examples} onChange={(event) => setForm({ ...form, examples: event.target.value })} placeholder="Examples JSON" required />
            <textarea className="field-input medium-textarea" value={form.testCases} onChange={(event) => setForm({ ...form, testCases: event.target.value })} placeholder="Test cases JSON" required />
            <textarea className="field-input medium-textarea" value={form.starterCode} onChange={(event) => setForm({ ...form, starterCode: event.target.value })} placeholder="Starter code JSON" required />
            <div className="action-row">
              <Button type="submit">{editingSlug ? 'Save Changes' : 'Create Question'}</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card variant="elevated">
        <h2 className="section-title">All Questions</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td>{question.title}</td>
                <td>{question.category}</td>
                <td>{question.difficulty}</td>
                <td>{question.slug}</td>
                <td>
                  <div className="action-row">
                    <Button size="sm" onClick={() => handleEdit(question.slug)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        await fetch(`/api/coding/questions/${question.slug}`, { method: 'DELETE' });
                        await fetchQuestions();
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
