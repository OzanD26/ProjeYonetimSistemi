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
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import { useProjects } from "./api/useProjects";
import { useCreateProject } from "./api/useCreateProject";
import { useDeleteProject } from "./api/useDeleteProject";
import { useUpdateProject } from "./api/useUpdateProject";
import type { Project } from "./api/types";

function statusTag(status: Project["status"]) {
  const color =
    status === "active" ? "green" : status === "paused" ? "orange" : "blue";
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <Tag color={color}>{label}</Tag>;
}

export default function ProjectsPage() {
  const { message } = App.useApp();
  const { data = [], isLoading } = useProjects();
  const createMut = useCreateProject();
  const deleteMut = useDeleteProject();
  const updateMut = useUpdateProject();

  // Create modal
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editing, setEditing] = useState<Project | null>(null);

  const onDelete = useCallback(
    async (id: string) => {
      await deleteMut.mutateAsync(id);
      message.success("Project deleted");
    },
    [deleteMut, message]
  );

  const onCreate = useCallback(async () => {
    try {
      const values = await form.validateFields();
      await createMut.mutateAsync(values);
      message.success("Project created");
      form.resetFields();
      setOpen(false);
    } catch {
      message.error("Please check the form fields.");
    }
  }, [createMut, form, message]);

  // Edit'i aç: sadece state ayarla, form değerleri initialValues ile dolacak
  const onEditOpen = useCallback((p: Project) => {
    setEditing(p);
    setEditOpen(true);
  }, []);

  const onEditSave = useCallback(async () => {
    try {
      if (!editing) return;
      const values = await editForm.validateFields();
      await updateMut.mutateAsync({ id: editing.id, data: values });
      message.success("Project updated");
      setEditOpen(false);
      setEditing(null);
    } catch {
      message.error("Please check the form fields.");
    }
  }, [editing, editForm, updateMut, message]);

  const columns: ColumnsType<Project> = useMemo(
    () => [
      { title: "Name", dataIndex: "name", key: "name" },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        ellipsis: true,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: statusTag,
        filters: [
          { text: "Active", value: "active" },
          { text: "Paused", value: "paused" },
          { text: "Archived", value: "archived" },
        ],
        onFilter: (v, r) => r.status === v,
      },
      {
        title: "Actions",
        key: "actions",
        width: 200,
        render: (_, r) => (
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

  const tableProps: TableProps<Project> = {
    rowKey: "id",
    loading: isLoading,
    dataSource: data,
    columns,
  };

  return (
    <Card
      title="Projects"
      extra={
        <Button type="primary" onClick={() => setOpen(true)}>
          New Project
        </Button>
      }
    >
      <Table<Project> {...tableProps} />

      {/* Create Modal */}
      <Modal
        open={open}
        title="Create Project"
        onCancel={() => setOpen(false)}
        onOk={onCreate}
        confirmLoading={createMut.isPending}
        okText="Create"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required" },
              {whitespace:true}
            ]}

          >
            <Input placeholder="e.g. Website Revamp" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
          <Form.Item label="Status" name="status" initialValue="active">
            <Select
              options={[
                { label: "Active", value: "active" },
                { label: "Paused", value: "paused" },
                { label: "Archived", value: "archived" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        title={editing ? `Edit Project: ${editing.name}` : "Edit Project"}
        onCancel={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onOk={onEditSave}
        confirmLoading={updateMut.isPending}
        okText="Save"
        destroyOnHidden
      >
        <Form
          key={editing?.id ?? "edit-form"}      // farklı proje seçilince yeniden mount olur
          form={editForm}
          layout="vertical"
          preserve={false}
          initialValues={{
            name: editing?.name,
            description: editing?.description,
            status: editing?.status ?? "active",
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select
              options={[
                { label: "Active", value: "active" },
                { label: "Paused", value: "paused" },
                { label: "Archived", value: "archived" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
