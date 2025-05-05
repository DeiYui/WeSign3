"use client";

import StudentLearningProcess from "@/components/Student/StudentLearningProcess";
import { useParams } from "next/navigation";

export default function StudentLearningProcessPage() {
  const params = useParams();
  const studentId = Number(params.id);

  if (!studentId) {
    return <div>Invalid student ID</div>;
  }

  return <StudentLearningProcess studentId={studentId} />;
}