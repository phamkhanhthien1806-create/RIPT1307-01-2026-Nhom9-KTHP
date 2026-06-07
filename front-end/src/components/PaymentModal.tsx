import React, { useState } from "react";
import { Modal, Radio, Button, Space, message, Typography, Divider, Card } from "antd";
import { 
  DollarOutlined, 
  QrcodeOutlined, 
  CreditCardOutlined, 
  WalletOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import api from "../utils/api";

const { Text, Paragraph, Title } = Typography;

interface PaymentModalProps {
  paymentId: number;
  amount: number;
  open: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ paymentId, amount, open, onClose }) => {
  const [method, setMethod] = useState<number>(2);
  const [submitting, setSubmitting] = useState(false);
  
  const [showSimulate, setShowSimulate] = useState(false);

  const handlePayment = async () => {
    if (method === 1) {
      Modal.info({
        title: "Hướng dẫn thanh toán Tiền mặt",
        content: (
          <div>
            <Paragraph>
              Vui lòng đến trực tiếp quầy thu ngân của trung tâm <b>Tata English Center</b> để đóng học phí bằng tiền mặt hoặc quẹt thẻ POS.
            </Paragraph>
            <Paragraph>
              Địa chỉ: <b>Số 12, Đường Láng, Đống Đa, Hà Nội</b>.
            </Paragraph>
            <Paragraph>
              Mã hóa đơn của bạn: <Text code>{paymentId}</Text>
            </Paragraph>
          </div>
        ),
        onOk() {
          onClose();
        },
      });
      return;
    }

    if (method === 2 || method === 3 || method === 4) {
      setShowSimulate(true);
    }
  };

  const handleSimulateSuccess = async () => {
    try {
      setSubmitting(true);
      message.loading({ content: "Đang giả lập xác thực giao dịch...", key: "simulate-loading", duration: 0 });
      
      await api.post(`/payments/${paymentId}/simulate-success`, {
        payment_method_id: method
      });

      message.success({ content: "Giả lập thanh toán thành công!", key: "simulate-loading" });
      onClose();
    } catch (error: any) {
      message.error({ 
        content: error.response?.data?.message || "Có lỗi xảy ra khi giả lập thanh toán.", 
        key: "simulate-loading" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (showSimulate) {
    let gatewayName = "VIETQR SANDBOX";
    let primaryColor = "#52c41a";
    let logoIcon = <QrcodeOutlined style={{ fontSize: "50px", color: "#52c41a" }} />;

    if (method === 3) {
      gatewayName = "MOMO SANDBOX";
      primaryColor = "#a0156d";
      logoIcon = <WalletOutlined style={{ fontSize: "50px", color: "#a0156d" }} />;
    } else if (method === 4) {
      gatewayName = "VNPAY SANDBOX";
      primaryColor = "#1890ff";
      logoIcon = <CreditCardOutlined style={{ fontSize: "50px", color: "#1890ff" }} />;
    }

    return (
      <Modal
        title={
          <div style={{ textAlign: "center", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "10px" }}>
            <span style={{ color: primaryColor, fontWeight: "bold", fontSize: "18px" }}>
              {gatewayName} (DEMO MÔ PHỎNG)
            </span>
          </div>
        }
        open={open}
        onCancel={() => setShowSimulate(false)}
        footer={null}
        width={450}
        closable={!submitting}
        destroyOnClose
      >
        <div style={{ textAlign: "center", padding: "20px 10px" }}>
          {logoIcon}
          <Title level={4} style={{ marginTop: "12px", marginBottom: "4px" }}>
            Cổng thanh toán giả lập {method === 2 ? "Chuyển khoản VietQR" : method === 3 ? "Ví MoMo" : "VNPAY"}
          </Title>
          <Paragraph type="secondary" style={{ fontSize: "13px" }}>
            Phương thức thanh toán này đã được cấu hình chế độ Demo để kiểm thử nhanh mà không cần liên kết ngân hàng thật.
          </Paragraph>

          {method === 2 && (
            <div style={{ margin: "16px 0", textAlign: "center" }}>
              <img 
                src={`https://img.vietqr.io/image/MB-19033338888-print.png?amount=${amount}&addInfo=HP%20${paymentId}&accountName=CONG%20TY%20TATA%20ENGLISH`}
                alt="VietQR Mock"
                style={{ width: "160px", height: "160px", border: "1px solid #d9d9d9", padding: "8px", borderRadius: "8px" }}
              />
              <div style={{ fontSize: "11px", color: "#8c8c8c", marginTop: "6px" }}>
                (Có thể quét thử QR bằng ứng dụng Ngân hàng hoặc nhấn nút bên dưới để hoàn tất nhanh)
              </div>
            </div>
          )}

          <Card style={{ margin: "20px 0", background: "#fafafa", border: "1px dashed #d9d9d9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <Text type="secondary">Mã hóa đơn:</Text>
              <Text strong>#{paymentId}</Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <Text type="secondary">Đơn vị thụ hưởng:</Text>
              <Text strong>Tata English Center</Text>
            </div>
            <Divider style={{ margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text type="secondary" strong>Số tiền:</Text>
              <Text strong style={{ fontSize: "18px", color: "#f5222d" }}>
                {Number(amount).toLocaleString("vi-VN")}đ
              </Text>
            </div>
          </Card>

          {submitting ? (
            <div style={{ margin: "20px 0" }}>
              <LoadingOutlined style={{ fontSize: 24, marginRight: 8 }} spin />
              <Text>Đang gửi dữ liệu xác nhận...</Text>
            </div>
          ) : (
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Button 
                type="primary" 
                block 
                size="large"
                style={{ background: primaryColor, borderColor: primaryColor }}
                onClick={handleSimulateSuccess}
              >
                Xác nhận thanh toán thành công
              </Button>
              <Button 
                block 
                size="large"
                onClick={() => {
                  setShowSimulate(false);
                  message.warning("Đã hủy giao dịch giả lập.");
                }}
              >
                Hủy bỏ giao dịch
              </Button>
            </Space>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={<Text style={{ fontSize: "18px", fontWeight: "bold" }}>Chọn phương thức thanh toán học phí</Text>}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={submitting}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" onClick={handlePayment} loading={submitting}>
          Tiếp tục thanh toán
        </Button>
      ]}
      width={480}
      destroyOnClose
    >
      <div style={{ margin: "16px 0" }}>
        <Card size="small" style={{ background: "#fafafa", marginBottom: "16px", borderLeft: "4px solid #1890ff" }}>
          <Text type="secondary">Mã hóa đơn: </Text>
          <Text strong>#{paymentId}</Text>
          <br />
          <Text type="secondary">Tổng số tiền: </Text>
          <Text strong style={{ fontSize: "16px", color: "#f5222d" }}>
            {Number(amount).toLocaleString("vi-VN")}đ
          </Text>
        </Card>

        <Radio.Group onChange={(e) => setMethod(e.target.value)} value={method} style={{ width: "100%" }}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Radio value={2} style={{ display: "flex", alignItems: "center", padding: "8px 0" }}>
              <Space>
                <QrcodeOutlined style={{ fontSize: "20px", color: "#52c41a" }} />
                <div>
                  <Text strong>Chuyển khoản VietQR (Mô phỏng)</Text>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Chế độ giả lập quét mã chuyển khoản nhanh không cần PayOS</div>
                </div>
              </Space>
            </Radio>
            <Radio value={3} style={{ display: "flex", alignItems: "center", padding: "8px 0" }}>
              <Space>
                <WalletOutlined style={{ fontSize: "20px", color: "#a0156d" }} />
                <div>
                  <Text strong>Ví điện tử MoMo (Mô phỏng)</Text>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Chế độ giả lập thanh toán nhanh qua Ví điện tử MoMo</div>
                </div>
              </Space>
            </Radio>
            <Radio value={4} style={{ display: "flex", alignItems: "center", padding: "8px 0" }}>
              <Space>
                <CreditCardOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
                <div>
                  <Text strong>Cổng VNPAY (Mô phỏng)</Text>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Chế độ giả lập thanh toán nhanh qua Thẻ ATM / Visa / Mastercard</div>
                </div>
              </Space>
            </Radio>
            <Divider style={{ margin: "4px 0" }} />
            <Radio value={1} style={{ display: "flex", alignItems: "center", padding: "8px 0" }}>
              <Space>
                <DollarOutlined style={{ fontSize: "20px", color: "#faad14" }} />
                <div>
                  <Text strong>Đóng tiền mặt tại quầy</Text>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Thanh toán trực tiếp tại văn phòng trung tâm</div>
                </div>
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </div>
    </Modal>
  );
};

export default PaymentModal;


