// src/features/tasks/TasksPage.tsx
import { useCallback, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  DatePicker,
  Tabs,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { RuleObject } from "antd/es/form";
import dayjs from "dayjs";

import { useTasks } from "./api/useTasks";
import { useCreateTask } from "./api/useCreateTask";
import { useDeleteTask } from "./api/useDeleteTask";
import { useUpdateTask } from "./api/useUpdateTask";
import type { Task } from "./api/types";

import KanbanBoard from "../board/KanbanBoard";

const { Text } = Typography;

/* =========================
   Shared types & helpers
   ========================= */
type SafeStatus = "todo" | "in_progress" | "done";
type StatusOption = { label: string; value: SafeStatus };

type TaskFormValues = {
  projectId?: string;
  title?: string;
  description?: string;
  status?: unknown;
  assignee?: string;
  dueDate?: dayjs.Dayjs | string | null;
};

type CreateInput = {
  projectId: string;
  title: string;
  description?: string;
  status: SafeStatus;
  assignee?: string;
  dueDate?: string;
  position: number;
};

const statusOptions: StatusOption[] = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
];

function normalizeStatus(v: unknown): SafeStatus {
  const s = String(v ?? "").toLowerCase().replace(/\s+/g, "_");
  if (s === "todo" || s === "in_progress" || s === "done") return s;
  return "todo";
}

const STATUS_META: Record<SafeStatus, { color?: string; label: string }> = {
  todo: { color: "orange", label: "To Do" },
  in_progress: { color: "blue", label: "In Progress" },
  done: { color: "green", label: "Done" },
};

function statusTag(raw: unknown) {
  const key = normalizeStatus(raw);
  const meta = STATUS_META[key];
  return <Tag color={meta.color}>{meta.label}</Tag>;
}

const notBlank = (msg: string) => ({
  validator(_: RuleObject, value: unknown) {
    if (typeof value === "string" && value.trim() === "") {
      return Promise.reject(new Error(msg));
    }
    return Promise.resolve();
  },
});

const optionalNotBlank = (msg: string) => ({
  validator(_: RuleObject, value: unknown) {
    if (value == null || value === "") return Promise.resolve();
    if (typeof value === "string" && value.trim() === "") {
      return Promise.reject(new Error(msg));
    }
    return Promise.resolve();
  },
});

function toISO(input?: dayjs.Dayjs | string | null): string | undefined {
  if (!input) return undefined;
  if (dayjs.isDayjs(input)) return input.toDate().toISOString();
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Aynı project + status içindeki max position + 1024 (yoksa 1024) */
function nextPositionFor(all: Task[], projectId: string, status: SafeStatus): number {
  type MaybePos = { position?: number };
  const same = all.filter(
    (t) =>
      String(t.projectId ?? "") === String(projectId) &&
      normalizeStatus(t.status) === status
  );
  if (same.length === 0) return 1024;
  const maxPos = Math.max(...same.map((t) => (t as MaybePos).position ?? 0));
  return maxPos + 1024;
}

function sanitizeToCreate(values: TaskFormValues, known: Task[]): CreateInput {
  const trim = (v?: string) => (typeof v === "string" ? v.trim() : v);
  const projectId = (trim(values.projectId) as string) || "";
  const title = (trim(values.title) as string) || "";
  if (!projectId || !title) throw new Error("Required fields missing.");
  const status = normalizeStatus(values.status);
  return {
    projectId,
    title,
    description: (trim(values.description) as string) || undefined,
    status,
    assignee: (trim(values.assignee) as string) || undefined,
    dueDate: toISO(values.dueDate),
    position: nextPositionFor(known, projectId, status),
  };
}

function buildUpdatePayload(values: TaskFormValues, editing: Task, all: Task[]) {
  const trim = (v?: string) => (typeof v === "string" ? v.trim() : v);
  const nextStatus = normalizeStatus(values.status ?? editing.status);
  const nextProjectId = (trim(values.projectId) as string) ?? editing.projectId ?? "";
  const payload: Partial<CreateInput> = {
    projectId: nextProjectId || undefined,
    title: (trim(values.title) as string) || undefined,
    description: (trim(values.description) as string) || undefined,
    status: nextStatus,
    assignee: (trim(values.assignee) as string) || undefined,
    dueDate: toISO(values.dueDate),
  };
  const prevStatus = normalizeStatus(editing.status);
  const prevProjectId = String(editing.projectId ?? "");
  if (nextStatus !== prevStatus || (nextProjectId && String(nextProjectId) !== prevProjectId)) {
    payload.position = nextPositionFor(all, nextProjectId || prevProjectId, nextStatus);
  }
  return payload;
}

/* =========================
   Table View
   ========================= */
function TaskTableView() {
  const { message } = App.useApp();
  const [statusFilter, setStatusFilter] = useState<SafeStatus | undefined>(undefined);

  const { data = [], isLoading } = useTasks(
    statusFilter ? { status: statusFilter } : undefined
  );
  const createMut = useCreateTask();
  const deleteMut = useDeleteTask();
  const updateMut = useUpdateTask();

  // Create modal
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<TaskFormValues>();

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm] = Form.useForm<TaskFormValues>();
  const [editing, setEditing] = useState<Task | null>(null);

  const onCreate = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const payload = sanitizeToCreate(values, data as Task[]);
      await createMut.mutateAsync(payload);
      message.success("Task created");
      form.resetFields();
      setOpen(false);
    } catch {
      message.error("Please check the form fields.");
    }
  }, [createMut, data, form, message]);

  const onEditOpen = useCallback((t: Task) => {
    setEditing(t);
    setEditOpen(true);
  }, []);

  const onEditSave = useCallback(async () => {
    try {
      if (!editing) return;
      const values = await editForm.validateFields();
      const payload = buildUpdatePayload(values, editing, data as Task[]);
      await updateMut.mutateAsync({ id: editing.id, data: payload });
      message.success("Task updated");
      setEditOpen(false);
      setEditing(null);
    } catch {
      message.error("Please check the form fields.");
    }
  }, [data, editing, editForm, updateMut, message]);

  const onDelete = useCallback(
    async (id: string) => {
      await deleteMut.mutateAsync(id);
      message.success("Task deleted");
    },
    [deleteMut, message]
  );

  const columns: ColumnsType<Task> = useMemo(
    () => [
      { title: "Title", dataIndex: "title", key: "title" },
      { title: "Assignee", dataIndex: "assignee", key: "assignee" },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: statusTag,
        filters: statusOptions.map((o) => ({ text: o.label, value: o.value })),
        onFilter: (v, r) => normalizeStatus(r.status) === v,
      },
      {
        title: "Due",
        dataIndex: "dueDate",
        key: "dueDate",
        render: (d?: string) => (d ? dayjs(d).format("DD MMM YYYY") : "-"),
      },
      {
        title: "Actions",
        key: "actions",
        width: 180,
        render: (_: unknown, r) => (
          <Space>
            <Button size="small" onClick={() => onEditOpen(r)}>
              Edit
            </Button>
            <Button
              danger
              size="small"
              loading={deleteMut.isPending}
              onClick={() => onDelete(r.id)}
            >
              Delete
            </Button>
          </Space>
        ),
      },
    ],
    [deleteMut.isPending, onDelete, onEditOpen]
  );

  return (
    <Card
      title="Tasks"
      extra={
        <Space>
          <Select<SafeStatus>
            allowClear
            placeholder="Filter status"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            options={statusOptions}
            size="middle"
          />
          <Button type="primary" onClick={() => setOpen(true)}>
            New Task
          </Button>
        </Space>
      }
    >
      <Table<Task> rowKey="id" loading={isLoading} dataSource={data} columns={columns} />

      {/* Create Modal */}
      <Modal
        open={open}
        title="Create Task"
        onCancel={() => setOpen(false)}
        onOk={onCreate}
        confirmLoading={createMut.isPending}
        okText="Create"
        destroyOnClose
      >
        <Form<TaskFormValues> form={form} layout="vertical" preserve={false}>
          <Form.Item
            label="Project ID"
            name="projectId"
            rules={[
              { required: true, message: "Project ID is required" },
              notBlank("Project ID cannot be blank"),
            ]}
          >
            <Input placeholder="e.g. 1" />
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Title is required" },
              notBlank("Title cannot be blank"),
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[optionalNotBlank("Description cannot be blank")]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Status" name="status" initialValue="todo">
            <Select<SafeStatus> options={statusOptions} />
          </Form.Item>

          <Form.Item
            label="Assignee"
            name="assignee"
            rules={[optionalNotBlank("Assignee cannot be blank")]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Due Date" name="dueDate">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        title={editing ? `Edit Task: ${editing.title}` : "Edit Task"}
        onCancel={() => {
          setEditOpen(false);
          setEditing(null);
          editForm.resetFields();
        }}
        onOk={onEditSave}
        confirmLoading={updateMut.isPending}
        okText="Save"
        destroyOnClose
      >
        <Form<TaskFormValues>
          key={editing?.id ?? "edit-form"}
          form={editForm}
          layout="vertical"
          preserve={false}
          initialValues={
            editing
              ? {
                  projectId: editing.projectId,
                  title: editing.title,
                  description: editing.description,
                  status: normalizeStatus(editing.status),
                  assignee: editing.assignee,
                  dueDate: editing.dueDate ? dayjs(editing.dueDate) : undefined,
                }
              : undefined
          }
        >
          <Form.Item
            label="Project ID"
            name="projectId"
            rules={[
              { required: true, message: "Project ID is required" },
              notBlank("Project ID cannot be blank"),
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Title is required" },
              notBlank("Title cannot be blank"),
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[optionalNotBlank("Description cannot be blank")]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select<SafeStatus> options={statusOptions} />
          </Form.Item>

          <Form.Item
            label="Assignee"
            name="assignee"
            rules={[optionalNotBlank("Assignee cannot be blank")]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Due Date" name="dueDate">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

/* =========================
   Tabs Wrapper (default export)
   ========================= */
export default function TasksPage() {
  return (
    <Card style={{ borderRadius: 14 }}>
      <Tabs
        defaultActiveKey="table"
        items={[
          { key: "table", label: "Table View", children: <TaskTableView /> },
          {
            key: "kanban",
            label: "Kanban Board",
            children: (
              <>
                <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                  Drag & drop ile durum değiştirin ve öncelik sıralayın.
                </Text>
                <KanbanBoard />
              </>
            ),
          },
        ]}
      />
    </Card>
  );
}
