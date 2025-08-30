import { useMemo, useState } from "react";
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag, App } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useProjects } from "./api/useProjects";
import { useCreateProject } from "./api/useCreateProject";
import { useDeleteProject } from "./api/useDeleteProject";
import type { Project } from "./api/types";

export default function ProjectsPage() {
  const { message } = App.useApp();
  const { data, isLoading } = useProjects();
  const createMut = useCreateProject();
  const deleteMut = useDeleteProject();

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const columns: ColumnsType<Project> = useMemo(
    () => [
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Description", dataIndex: "description", key: "description", ellipsis: true },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (s: Project["status"]) => {
          const color = s === "active" ? "green" : s === "paused" ? "orange" : "default";
          const label = s[0].toUpperCase() + s.slice(1);
          return <Tag color={color}>{label}</Tag>;
        },
        filters: [
          { text: "Active", value: "active" },
          { text: "Paused", value: "paused" },
          { text: "Archived", value: "archived" },
        ],
        onFilter: (v, record) => record.status === v,
      },
      {
        title: "Actions",
        key: "actions",
        width: 140,
        render: (_, r) => (
          <Space>
            {/* gelecekte: Edit */}
            <Button
              danger
              size="small"
              loading={deleteMut.isPending}
              onClick={async () => {
                await deleteMut.mutateAsync(r.id);
                message.success("Project deleted");
              }}
            >
              Delete
            </Button>
          </Space>
        ),
      },
    ],
    [deleteMut.isPending]
  );

  const onCreate = async () => {
    try {
      const values = await form.validateFields();
      await createMut.mutateAsync(values);
      message.success("Project created");
      form.resetFields();
      setOpen(false);
   } catch  {
  message.error("Please check the form fields.");
}
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
      <Table<Project>
        rowKey="id"
        loading={isLoading}
        dataSource={data}
        columns={columns}
      />

      <Modal
        open={open}
        title="Create Project"
        onCancel={() => setOpen(false)}
        onOk={onCreate}
        confirmLoading={createMut.isPending}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
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
    </Card>
  );
}
