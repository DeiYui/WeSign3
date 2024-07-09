import { UserOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar } from "antd";
import Tooltip from "antd/lib/tooltip";
import React from "react";

interface ContactButtonProps {
  contact: Contact;
  selectedContactId: number;
  onClick: ({}: { contactId: number; contactName: string }) => void;
}

const ContactButton: React.FC<ContactButtonProps> = ({
  contact,
  selectedContactId,
  onClick,
}) => {
  const queryClient = useQueryClient();
  const handleButtonClick = () => {
    onClick({
      contactId: contact.contactId,
      contactName: contact.contactName,
    });
  };

  return (
    <Tooltip title={contact.contactName} placement="left">
      <div
        className="relative flex flex-col items-center justify-center gap-3 hover:cursor-pointer"
        onClick={handleButtonClick}
      >
        <div className={`status`} />
        {contact.contactId === selectedContactId && (
          <div className="absolute right-0 top-1/3 h-8 w-[2px] bg-neutral-500 transition-all"></div>
        )}
        <Avatar
          size={40}
          src={contact.avatarLocation}
          alt={contact.contactName}
          icon={<UserOutlined />}
        />
      </div>
    </Tooltip>
  );
};

export default ContactButton;
