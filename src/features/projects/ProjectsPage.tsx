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
import type { Project } from "./api/types";

function statusTag(status: Project["status"]) {
  const color =
    status === "active" ? "green" : status === "paused" ? "orange" : "default";
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <Tag color={color}>{label}</Tag>;
}

export default function ProjectsPage() {
  const { message } = App.useApp();
  const { data = [], isLoading } = useProjects();
  const createMut = useCreateProject();
  const deleteMut = useDeleteProject();

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const onDelete = useCallback(
    async (id: string) => {
      await deleteMut.mutateAsync(id);
      message.success("Project deleted");
    },
    [deleteMut, message]
  );

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
        onFilter: (value, record) =>
          record.status === (value as Project["status"]),
      },
      {
        title: "Actions",
        key: "actions",
        width: 140,
        render: (_: unknown, r) => (
          <Space>
            {/* gelecekte: Edit */}
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
    [deleteMut.isPending, onDelete]
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

      <Modal
        open={open}
        title="Create Project"
        onCancel={() => setOpen(false)}
        onOk={onCreate}
        confirmLoading={createMut.isPending}
        okText="Create"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
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
