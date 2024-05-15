"use client";
import { useEffect, useState } from "react";
import { Button, Form, message } from "antd";
import { InputOTP } from "antd-input-otp";
import LayoutAuth from "..";
import { LeftCircleFilled, LeftOutlined } from "@ant-design/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Auth from "@/model/Auth";

const VerifyOtp = () => {
  //* Hooks
  const router = useRouter();
  const [form] = Form.useForm();
  const searchParams = useSearchParams();

  //* State
  const [seconds, setSeconds] = useState(120);

  useEffect(() => {
    seconds > 0 && setTimeout(() => setSeconds(seconds - 1), 1000);
  }, [seconds]);

  //* API
  const veryOtpMutation = useMutation({
    mutationFn: Auth.validateOtp,
    onSuccess: async (res) => {
      console.log("res", res);
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const handleFinish = (values: { otp: any }) => {
    const { otp } = values;
    veryOtpMutation.mutate({
      email: searchParams.get("email"),
      otpNum: parseInt(otp.join("")),
    });
  };

  return (
    <LayoutAuth>
      <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
        <section className="card">
          <div
            className="mb-6 text-primary hover:cursor-pointer"
            onClick={() => router.back()}
          >
            <LeftOutlined size={30} /> Quay lại
          </div>
          <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
            Xác thực OTP
          </h2>
          <Form form={form} onFinish={handleFinish}>
            <Form.Item
              name="otp"
              className="center-error-message"
              rules={[{ validator: async () => Promise.resolve() }]}
            >
              <InputOTP autoFocus inputType="numeric" length={6} />
            </Form.Item>

            <Form.Item noStyle>
              <Button block size="large" htmlType="submit" type="primary">
                Xác nhận
              </Button>
            </Form.Item>
          </Form>
          <div className="mt-6 flex h-7 w-[560px]  flex-col items-start justify-start gap-4">
            <div className="text-gray-900 text-sm font-normal leading-tight tracking-tight">
              Gửi lại mã xác thực ({seconds}s)
            </div>
            <Button block size="large" disabled={seconds > 0}>
              Gửi lại
            </Button>
          </div>
        </section>
      </div>
    </LayoutAuth>
  );
};

export default VerifyOtp;
