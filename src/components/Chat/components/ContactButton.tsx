import { Button, Avatar } from "antd";
import Tooltip from "antd/lib/tooltip";
import { TooltipPlacement } from "antd/lib/tooltip";
import clsx from "clsx";
import React from "react";
import { UserOutlined } from "@ant-design/icons";

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
