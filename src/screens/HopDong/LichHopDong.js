import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styled from "styled-components";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const CalendarContainer = styled.div`
  padding: 20px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Button = styled.button`
  background-color: ${(props) => (props.active ? "#0056b3" : props.bgColor || "#007bff")};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 5px;
  &:hover {
    opacity: 0.8;
  }
`;

const LichHopDong = () => {
    const [currentView, setCurrentView] = useState("dayGridMonth");

    useEffect(() => {
        // Khi load trang, mặc định chọn "Tháng"
        setCurrentView("dayGridMonth");
    }, []);

    return (
        <CalendarContainer>
            <CalendarHeader>
                <div>
                    <Button
                        bgColor="#007bff"
                        active={currentView === "dayGridMonth"}
                        onClick={() => setCurrentView("dayGridMonth")}
                    >
                        Tháng
                    </Button>
                    <Button
                        bgColor="#28a745"
                        active={currentView === "timeGridWeek"}
                        onClick={() => setCurrentView("timeGridWeek")}
                    >
                        Tuần
                    </Button>
                    <Button
                        bgColor="#6c757d"
                        active={currentView === "timeGridDay"}
                        onClick={() => setCurrentView("timeGridDay")}
                    >
                        Ngày
                    </Button>
                </div>
            </CalendarHeader>


            <FullCalendar
                key={currentView}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={currentView}
                headerToolbar={false}
                events={[
                    { title: "LONG", start: "2025-03-07", color: "blue" },
                    {
                        title: "PSC A-B",
                        start: "2025-03-30T08:00:00",
                        end: "2025-03-30T12:00:00",
                        color: "red"
                    },
                ]}
            />
        </CalendarContainer>
    );
};

export default LichHopDong;