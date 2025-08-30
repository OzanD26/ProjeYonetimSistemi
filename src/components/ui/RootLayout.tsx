<<<<<<< HEAD
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
=======
// src/components/ui/RootLayout.tsx
import { Layout, Menu, Button, Dropdown, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
>>>>>>> 9447b77 (Mock api ayarları login girişi ayarlandı)

const { Header, Sider, Content } = Layout;

export default function RootLayout() {
<<<<<<< HEAD
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} style={{ color: "#fff", padding: 16 }}>Sidebar</Sider>
      <Layout>
        <Header style={{ color: "#fff" }}>Topbar</Header>
=======
  const nav = useNavigate();
  const { pathname } = useLocation();
  const setToken = useAuth((s) => s.setToken);

  const items: MenuProps["items"] = [
    { key: "/", label: "Dashboard" },
    { key: "/projects", label: "Projects" },
    { key: "/tasks", label: "Tasks" },
    { key: "/team", label: "Team" },
  ];

  const onMenuClick: MenuProps["onClick"] = (e) => {
    nav(e.key);
  };

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

  // aktif menü anahtarını route'a göre seç
  const selectedKey =
    items?.find((it) => pathname === it?.key)?.key ?? "/";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={220}
        breakpoint="lg"
        collapsedWidth={64}
        style={{ padding: 8 }}
      >
        <div style={{ color: "#fff", fontWeight: 700, padding: 12 }}>
          PM Tool
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          onClick={onMenuClick}
          selectedKeys={[selectedKey as string]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            color: "#fff",
          }}
        >
          <Typography.Text style={{ color: "#fff" }}>Topbar</Typography.Text>

          <Dropdown menu={{ items: userMenu }} trigger={["click"]}>
            <Button type="text" style={{ color: "#fff" }}>
              <Space>Demo User ▾</Space>
            </Button>
          </Dropdown>
        </Header>

>>>>>>> 9447b77 (Mock api ayarları login girişi ayarlandı)
        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
