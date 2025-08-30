import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export default function RootLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} style={{ color: "#fff", padding: 16 }}>Sidebar</Sider>
      <Layout>
        <Header style={{ color: "#fff" }}>Topbar</Header>
        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
