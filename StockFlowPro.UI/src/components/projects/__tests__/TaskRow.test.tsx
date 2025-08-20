import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskRow from '../components/TaskRow';
import type { Task } from '../types/task';

const baseTask: Task = {
  id: 1,
  task: 'Parent Task',
  description: 'Desc',
  priority: 'Normal',
  progress: 50,
  dueDate: '2025-08-18',
  assignee: [{ initials: 'AB', color: 'bg-blue-500' }],
  completed: false,
  type: 'parent',
  subtaskCount: 0,
  commentCount: 0,
  children: []
};

const renderTaskRow = (overrides: Partial<React.ComponentProps<typeof TaskRow>> = {}) => {
  const props: React.ComponentProps<typeof TaskRow> = {
    task: baseTask,
    expanded: false,
    isChild: false,
    isLast: false,
    parentId: null,
    onToggleExpand: vi.fn(),
    getPriorityColor: () => 'bg-teal-50 text-teal-700 border-teal-200',
    getProgressColor: () => 'bg-blue-500',
    deletingTaskId: null,
    onStartAddSubtask: vi.fn(),
    onEditTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onDeleteSubtask: vi.fn(),
    openMenuForTaskId: null,
    setOpenMenuForTaskId: vi.fn(),
    ...overrides,
  };

  render(<table><tbody><TaskRow {...props} /></tbody></table>);
  return props;
};

describe('TaskRow actions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('calls onEditTask when Edit is clicked', () => {
    const props = renderTaskRow({ openMenuForTaskId: 1 });
    fireEvent.click(screen.getByText('Edit'));
    expect(props.onEditTask).toHaveBeenCalledWith(1);
  });

  it('calls onDeleteTask when Delete on parent row is clicked', () => {
    const props = renderTaskRow({ openMenuForTaskId: 1 });
    fireEvent.click(screen.getByText('Delete'));
    expect(props.onDeleteTask).toHaveBeenCalledWith(1);
  });

  it('parent row shows + Add subtask and triggers handler with parentId', () => {
    const onStartAddSubtask = vi.fn();
    renderTaskRow({ openMenuForTaskId: 1, onStartAddSubtask });
    fireEvent.click(screen.getByText('+ Add subtask'));
    expect(onStartAddSubtask.mock.calls[0][0]).toBe(1);
  });

  it('child row Delete calls onDeleteSubtask with parentId', () => {
    const onDeleteSubtask = vi.fn();
    const child: Task = { ...baseTask, id: 2, type: undefined };
  // Component is controlled via openMenuForTaskId; provide it so menu is rendered
  renderTaskRow({ task: child, isChild: true, parentId: 1, onDeleteSubtask, openMenuForTaskId: 2 });
  fireEvent.click(screen.getByText('Delete'));
    expect(onDeleteSubtask).toHaveBeenCalledWith(2, 1);
  });
});
