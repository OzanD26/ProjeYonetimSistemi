<<<<<<< HEAD
=======
// src/features/auth/Login.tsx
>>>>>>> 9447b77 (Mock api ayarları login girişi ayarlandı)
import { Button, Card, Form, Input, Typography } from "antd";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const setToken = useAuth((s) => s.setToken);
  const navigate = useNavigate();

  const onFinish = () => {
<<<<<<< HEAD
    setToken("mock-token");        // mock login
=======
    setToken("mock-token");
>>>>>>> 9447b77 (Mock api ayarları login girişi ayarlandı)
    navigate("/", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Card title="Login" style={{ width: 360 }}>
        <Form layout="vertical" onFinish={onFinish}>
<<<<<<< HEAD
          <Form.Item label="Email" name="email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
=======
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email zorunlu" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Şifre zorunlu" }]}
          >
>>>>>>> 9447b77 (Mock api ayarları login girişi ayarlandı)
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Sign in
          </Button>
        </Form>
        <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
          Demo için herhangi bir değer girebilirsin.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
