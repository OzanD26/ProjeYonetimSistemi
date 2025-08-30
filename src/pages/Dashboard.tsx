// src/pages/Dashboard.tsx
import { Card, Col, List, Row, Statistic, Typography } from "antd";

const stats = [
  { title: "Total Projects", value: 6 },
  { title: "Open Tasks", value: 21 },
  { title: "Due Soon", value: 4 },
];

const activities = [
  "You assigned Task #132 to Ali",
  "New project created: Website Revamp",
  "Task #128 moved to In Progress",
  "Ayşe commented on Task #117",
];

export default function Dashboard() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Row gutter={[16, 16]}>
        {stats.map((s) => (
          <Col key={s.title} xs={24} sm={12} md={8}>
            <Card>
              <Statistic title={s.title} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Recent Activity">
        <List
          dataSource={activities}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </Card>

      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        (Bu veriler mock. Hafta 2’de React Query ile gerçek istekleri bağlayacağız.)
      </Typography.Paragraph>
    </div>
  );
}
