// src/components/ui/RootLayout.tsx
import { Layout, Menu, Button, Dropdown, Space, Typography, Grid } from "antd";
import type { MenuProps } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function RootLayout() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const setToken = useAuth((s) => s.setToken);
  const screens = useBreakpoint();

  const items: MenuProps["items"] = [
    { key: "/", label: "Dashboard" },
    { key: "/projects", label: "Projects" },
    { key: "/tasks", label: "Tasks" },
    { key: "/team", label: "Team" },
  ];

  const selectedKey = items?.find((it) => pathname === it?.key)?.key ?? "/";

  const userMenu: MenuProps["items"] = [
    { key: "profile", label: "Profile (coming soon)" },
    { type: "divider" },
    {
      key: "logout",
      label: "Logout",
      onClick: () => {
        setToken(null);
        nav("/login", { replace: true });
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} breakpoint="lg" collapsedWidth={64} style={{ padding: 8 }}>
        <div style={{ color: "#fff", fontWeight: 700, padding: 12 }}>Proje Yönetim</div>
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[selectedKey as string]}
          onClick={(e) => nav(e.key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: screens.xs ? "0 8px" : "0 16px",
            color: "#fff",
          }}
        >
          <Typography.Text style={{ color: "#fff" }}></Typography.Text>

          <Dropdown menu={{ items: userMenu }} trigger={["click"]}>
            <Button type="text" style={{ color: "#fff" }}>
              <Space>Demo User ▾</Space>
            </Button>
          </Dropdown>
        </Header>

       
        <Content className="app-content">
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
