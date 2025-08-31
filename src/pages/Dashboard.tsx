
import {
  App,
  Button,
  Card,
  Col,
  Grid,
  List,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Typography,
} from "antd";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../features/projects/api/useProjects";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

/** Küçük yardımcı kart – görünümü değiştirmeden tekrarları azaltır */
function StatCard(props: { title: string; loading: boolean; value: number | string }) {
  return (
    <Card style={{ borderRadius: 14 }}>
      {props.loading ? <Skeleton active paragraph={false} /> : (
        <Statistic title={props.title} value={props.value} />
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { message } = App.useApp();
  const nav = useNavigate();
  const screens = useBreakpoint();

  const {
    data: projects = [],
    isLoading,
    isError,
    error,
  } = useProjects();

  /** Türetilmiş metrikler (memoize) */
  const { total, active, paused, archived, distribution, donePercent } = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "active").length;
    const paused = projects.filter((p) => p.status === "paused").length;
    const archived = projects.filter((p) => p.status === "archived").length;

    return {
      total,
      active,
      paused,
      archived,
      distribution: [
        { label: "Active", value: active },
        { label: "Paused", value: paused },
        { label: "Archived", value: archived },
      ],
      donePercent: total ? Math.round((archived / total) * 100) : 0,
    };
  }, [projects]);

  /** Hata mesajını bir kez göster */
  useEffect(() => {
    if (isError) {
      // eslint-disable-next-line no-console
      console.error(error);
      message.error("Dashboard verileri alınırken bir sorun oluştu.");
    }
  }, [isError, error, message]);

  /** Mock activity – Tasks bağlanınca gerçek veriye dönecek */
  const activities = useMemo(
    () => ["Project listesi güncellendi"],
    []
  );

  /** responsive boşluklar */
  const pageGutter = screens.xs ? 8 : 16;

  return (
    <div style={{ display: "grid", gap: pageGutter }}>
      {/* Top section: greeting + quick actions */}
      <Card style={{ borderRadius: 14 }} bodyStyle={{ padding: screens.xs ? 12 : 16 }}>
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col flex="auto">
            <Space direction="vertical" size={0}>
              <Text type="secondary">Welcome back 👋</Text>
              <Title level={screens.xs ? 4 : 3} style={{ margin: 0, lineHeight: 1.2 }}>
                Project Overview
              </Title>
              <Text type="secondary">
                {new Date().toLocaleDateString()} • Keep things moving.
              </Text>
            </Space>
          </Col>
          <Col>
            <Space wrap>
              <Button onClick={() => nav("/projects")}>View Projects</Button>
              <Button type="primary" onClick={() => nav("/projects")}>
                New Project
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* KPI cards */}
      <Row gutter={[pageGutter, pageGutter]}>
        <Col xs={24} sm={12} md={6}><StatCard title="Total Projects" loading={isLoading} value={total} /></Col>
        <Col xs={24} sm={12} md={6}><StatCard title="Active"          loading={isLoading} value={active} /></Col>
        <Col xs={24} sm={12} md={6}><StatCard title="Paused"          loading={isLoading} value={paused} /></Col>
        <Col xs={24} sm={12} md={6}><StatCard title="Archived"        loading={isLoading} value={archived} /></Col>
      </Row>

      {/* Middle section: progress + distribution */}
      <Row gutter={[pageGutter, pageGutter]}>
        <Col xs={24} md={12}>
          <Card title="Overall Progress" style={{ borderRadius: 14 }}>
            {isLoading ? (
              <Skeleton active />
            ) : (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Space align="center" style={{ width: "100%" }}>
                  <Progress
                    percent={donePercent}
                    status={donePercent === 100 ? "success" : "active"}
                    style={{ flex: 1 }}
                  />
                  <Text type="secondary">
                    {archived} of {total} done
                  </Text>
                </Space>

                <Row gutter={[8, 8]}>
                  {distribution.map((d) => (
                    <Col xs={8} key={d.label}>
                      <Card size="small">
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">{d.label}</Text>
                          <Title level={3} style={{ margin: 0 }}>
                            {isLoading ? "-" : d.value}
                          </Title>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Space>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Recent Activity" style={{ borderRadius: 14 }}>
            {isLoading ? (
              <Skeleton active />
            ) : (
              <List dataSource={activities} renderItem={(item) => <List.Item>{item}</List.Item>} />
            )}
          </Card>
        </Col>
      </Row>

      <Text type="secondary" style={{ marginTop: 4 }}>
        (Tasks bağlanınca ilerleme ve activity gerçek verilere dönecek.)
      </Text>
    </div>
  );
}
