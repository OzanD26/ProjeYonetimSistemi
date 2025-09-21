// features/board/KanbanBoard.tsx
import { useMemo, useState, useCallback } from "react";
import { Card, Col, Empty, Input, Row, Select, Space, Tag, Typography, App } from "antd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd"; // <-- type-only
import { useTasks } from "../tasks/api/useTasks";
import { useUpdateTask } from "../tasks/api/useUpdateTask";
import type { Task } from "../tasks/api/types";

type S = Task["status"];
const ORDER: S[] = ["todo", "in_progress", "done"];
const LABEL: Record<S,string> = { todo: "To Do", in_progress: "In Progress", done: "Done" };
const COLOR: Record<S,string> = { todo: "default", in_progress: "blue", done: "green" };

export default function KanbanBoard() {
  const { message } = App.useApp();
  const [projectId, setProjectId] = useState<string>();
  const { data: tasks = [], isLoading } = useTasks(projectId ? { projectId } : undefined);
  const update = useUpdateTask();

  const cols = useMemo(() => {
    const by: Record<S, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const t of tasks) by[t.status].push(t);
    (Object.keys(by) as S[]).forEach(s => by[s].sort((a,b)=>a.position-b.position));
    return by;
  }, [tasks]);

  // Komşuların ortalaması (veya uçlara sabit ekleme)
  function computeNewPosition(list: Task[], toIndex: number): number {
    const prev = list[toIndex - 1]?.position;
    const next = list[toIndex]?.position;
    if (prev != null && next != null) return (prev + next) / 2;
    if (prev != null) return prev + 1024;      // sona taşındı
    if (next != null) return next / 2;         // başa taşındı
    return 1024;                               // ilk eleman
  }

  const onDragEnd = useCallback(async (r: DropResult) => {
    const { source, destination, draggableId } = r;
    if (!destination) return;

    const fromS = source.droppableId as S;
    const toS   = destination.droppableId as S;
    const fromIdx = source.index;
    const toIdx   = destination.index;

    if (fromS === toS && fromIdx === toIdx) return;

    const fromList = [...cols[fromS]];
    const toList   = fromS === toS ? fromList : [...cols[toS]];

    // sürüklenen task
    const task = fromList.find(t => t.id === draggableId);
    if (!task) return;

    // listeler üzerinde geçici yer değiştir
    if (fromS === toS) {
      fromList.splice(fromIdx, 1);
      fromList.splice(toIdx, 0, task);
    } else {
      fromList.splice(fromIdx, 1);
      toList.splice(toIdx, 0, task);
    }

    const newPos = computeNewPosition(toList, toIdx);
    const payload = { status: toS, position: newPos };

    try {
      await update.mutateAsync({ id: task.id, data: payload });
      message.success("Task updated");
    } catch {
      message.error("Failed to move task");
    }
  }, [cols, message, update]);

  return (
    <Space direction="vertical" size={16} style={{ display: "block" }}>
      {/* header / filter */}
      <Card styles={{ body: { padding: 12 } }} style={{ borderRadius: 14 }}>
        <Row align="middle" justify="space-between" gutter={[12,12]}>
          <Col flex="auto">
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Board</Typography.Text>
              <Typography.Title level={3} style={{ margin: 0 }}>Kanban</Typography.Title>
              <Typography.Text type="secondary">
                {projectId ? `Project #${projectId}` : "All projects"}
              </Typography.Text>
            </Space>
          </Col>
          <Col>
            <Input
              placeholder="Filter by Project ID (e.g. 1)"
              style={{ width: 220 }}
              value={projectId}
              onChange={(e)=>setProjectId(e.target.value || undefined)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      <DragDropContext onDragEnd={onDragEnd}>
        <Row gutter={[12,12]}>
          {ORDER.map((s) => (
            <Col key={s} xs={24} md={8}>
              <Card
                title={<Space><Tag color={COLOR[s]}>{LABEL[s]}</Tag>
                  <Typography.Text type="secondary">{cols[s].length}</Typography.Text>
                </Space>}
                loading={isLoading}
                style={{ borderRadius: 14, minHeight: 260 }}
              >
                <Droppable droppableId={s}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: 200,
                        transition: "background 0.2s",
                        background: snapshot.isDraggingOver ? "rgba(0,0,0,0.03)" : "transparent",
                        borderRadius: 8, padding: 4,
                      }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }} size={12}>
                        {cols[s].length === 0 && !isLoading ? (
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                          cols[s].map((t, idx) => (
                            <Draggable key={t.id} draggableId={t.id} index={idx}>
                              {(dragProvided, dragSnap) => (
                                <Card
                                  size="small"
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  style={{
                                    borderRadius: 10,
                                    boxShadow: dragSnap.isDragging ? "0 6px 16px rgba(0,0,0,0.12)" : undefined,
                                    ...dragProvided.draggableProps.style,
                                  }}
                                >
                                  <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                    <Space align="center" style={{ justifyContent:"space-between", width:"100%" }}>
                                      <Typography.Text strong>{t.title}</Typography.Text>
                                      <Tag>{t.projectId}</Tag>
                                    </Space>
                                    {t.description && (
                                      <Typography.Text type="secondary">{t.description}</Typography.Text>
                                    )}
                                    <Space align="center" style={{ justifyContent:"space-between", width:"100%" }}>
                                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                        Assignee: {t.assignee || "-"}
                                      </Typography.Text>
                                      <Select
                                        size="small"
                                        value={t.status}
                                        style={{ width: 150 }}
                                        onChange={(val)=>update.mutate({ id: t.id, data: { status: val as S } })}
                                        options={[
                                          { label: "To Do", value: "todo" },
                                          { label: "In Progress", value: "in_progress" },
                                          { label: "Done", value: "done" },
                                        ]}
                                      />
                                    </Space>
                                  </Space>
                                </Card>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </Space>
                    </div>
                  )}
                </Droppable>
              </Card>
            </Col>
          ))}
        </Row>
      </DragDropContext>
    </Space>
  );
}
