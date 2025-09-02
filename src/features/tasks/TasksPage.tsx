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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTasks } from "./api/useTasks";
import { useCreateTask } from "./api/useCreateTask";
import { useDeleteTask } from "./api/useDeleteTask";
import { useUpdateTask } from "./api/useUpdateTask";
import type { Task, TaskStatus } from "./api/types";

const statusOptions = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
];

function statusTag(s: TaskStatus) {
  const map: Record<TaskStatus, { color: string; label: string }> = {
    todo: { color: "default", label: "To Do" },
    in_progress: { color: "blue", label: "In Progress" },
    done: { color: "green", label: "Done" },
  };
  const v = map[s];
  return <Tag color={v.color}>{v.label}</Tag>;
}

export default function TasksPage() {
  const { message } = App.useApp();

  // filtre (çok basit örnek)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data = [], isLoading } = useTasks({ status: statusFilter });
  const createMut = useCreateTask();
  const deleteMut = useDeleteTask();
  const updateMut = useUpdateTask();

  // create modal
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editing, setEditing] = useState<Task | null>(null);

  const onCreate = useCallback(async () => {
    try {
      const values = await form.validateFields();
      await createMut.mutateAsync({
        projectId: values.projectId,
        title: values.title,
        description: values.description,
        status: values.status,
        assignee: values.assignee,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      });
      message.success("Task created");
      form.resetFields();
      setOpen(false);
    } catch {
      message.error("Please check the form fields.");
    }
  }, [createMut, form, message]);

  const onEditOpen = useCallback((t: Task) => {
    setEditing(t);
    setEditOpen(true);
  }, []);

  const onEditSave = useCallback(async () => {
    try {
      if (!editing) return;
      const values = await editForm.validateFields();
      await updateMut.mutateAsync({
        id: editing.id,
        data: {
          projectId: values.projectId,
          title: values.title,
          description: values.description,
          status: values.status,
          assignee: values.assignee,
          dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        },
      });
      message.success("Task updated");
      setEditOpen(false);
      setEditing(null);
    } catch {
      message.error("Please check the form fields.");
    }
  }, [editing, editForm, updateMut, message]);

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
        onFilter: (v, r) => r.status === v,
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
        render: (_, r) => (
          <Space>
            <Button size="small" onClick={() => onEditOpen(r)}>
              Edit
            </Button>
            <Button danger size="small" loading={deleteMut.isPending} onClick={() => onDelete(r.id)}>
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
          <Select
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
      <Table<Task>
        rowKey="id"
        loading={isLoading}
        dataSource={data}
        columns={columns}
      />

      {/* Create Modal */}
      <Modal
        open={open}
        title="Create Task"
        onCancel={() => setOpen(false)}
        onOk={onCreate}
        confirmLoading={createMut.isPending}
        okText="Create"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            label="Project ID"
            name="projectId"
            rules={[{ required: true, message: "Project ID is required" }]}
          >
            <Input placeholder="e.g. 1" />
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Status" name="status" initialValue="todo">
            <Select options={statusOptions} />
          </Form.Item>

          <Form.Item label="Assignee" name="assignee">
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
        destroyOnHidden
      >
        <Form
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
                  status: editing.status,
                  assignee: editing.assignee,
                  dueDate: editing.dueDate ? dayjs(editing.dueDate) : undefined,
                }
              : undefined
          }
        >
          <Form.Item
            label="Project ID"
            name="projectId"
            rules={[{ required: true, message: "Project ID is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select options={statusOptions} />
          </Form.Item>

          <Form.Item label="Assignee" name="assignee">
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
