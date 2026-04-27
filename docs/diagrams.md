# OOAD Diagrams

## Class Diagram

```mermaid
classDiagram
    class AddAppointmentForm {
      +Date selectedDateTime
      +string inputTitle
      +string inputLocation
      +Date inputStartTime
      +Date inputEndTime
      +ReminderMethod[] selectedReminders
      +validateInput() ValidationResult
    }

    class Calendar {
      +number calendarId
      +number userId
      +Appointment[] appointments
      +addAppointment(appointment)
      +findConflictingAppointment(candidate) Appointment
      +findMatchingGroupMeeting(title, duration, start) GroupMeeting
      +replaceAppointment(oldId, replacement)
    }

    class Appointment {
      +number appointmentId
      +string title
      +string location
      +Date startTime
      +Date endTime
      +Reminder[] reminders
      +getDuration() number
      +overlapsWith(other) boolean
      +addReminder(reminder)
    }

    class GroupMeeting {
      +number ownerId
      +User[] participants
      +User[] pendingRequests
      +hasSameTitleAndDuration(title, duration, start) boolean
      +requestToJoin(user)
      +approveParticipant(user)
      +rejectParticipant(user)
    }

    class Reminder {
      +number reminderId
      +Date remindAt
      +ReminderMethod method
      +getReminderInfo() string
    }

    class User {
      +number userId
      +string fullName
    }

    class AppointmentService {
      -ICalendarRepository repository
      +getAppointments() Appointment[]
      +addAppointment(request, decision) AddAppointmentResult
      +approveRequest(meetingId, user)
      +rejectRequest(meetingId, user)
    }

    class AppointmentController {
      -AppointmentService service
      +listAppointments() Appointment[]
      +createAppointment(request, decision) AddAppointmentResult
    }

    GroupMeeting --|> Appointment
    Calendar "1" *-- "0..*" Appointment
    Appointment "1" *-- "0..*" Reminder
    Calendar "1" o-- "1" User
    GroupMeeting "0..*" o-- "0..*" User : participants
    GroupMeeting "0..*" o-- "0..*" User : pendingRequests
    AddAppointmentForm ..> AppointmentService : validation & creation
    AppointmentController --> AppointmentService
    AppointmentService --> Calendar
```

## Sequence Diagram: Add Calendar Appointment

```mermaid
sequenceDiagram
    actor User
    participant UI as AddAppointmentFormModal
    participant Page as CalendarPage
    participant Controller as AppointmentController
    participant Service as AppointmentService
    participant Model as Calendar / Appointment

    User->>UI: Nhập thông tin (Title, Time, Reminders, ...)
    User->>UI: Click "Tạo lịch ngay"
    UI->>Page: onSubmit(request)
    Page->>Controller: createAppointment(request)
    Controller->>Service: addAppointment(request)
    
    Service->>Service: form.validateInput()
    alt Dữ liệu không hợp lệ (Trống tên, duration <= 0, ...)
        Service-->>Controller: status: 'INVALID'
        Controller-->>Page: status: 'INVALID'
        Page-->>User: Hiển thị Alert báo lỗi
    else Dữ liệu hợp lệ
        Service->>Service: findMatchingGroupMeeting(title, duration, start)
        alt Tìm thấy Group Meeting trùng khớp
            Service-->>Controller: status: 'GROUP_MEETING_SUGGESTION'
            Controller-->>Page: status: 'GROUP_MEETING_SUGGESTION'
            Page-->>User: window.confirm("Bạn có muốn xin tham gia họp nhóm?")
            alt User chọn JOIN
                Page->>Controller: createAppointment(request, joinGroupMeeting: true)
                Controller->>Service: addAppointment(..., joinGroupMeeting: true)
                Service->>Model: groupMeeting.requestToJoin(currentUser)
                Service-->>Page: status: 'JOINED_GROUP_MEETING'
                Page-->>User: Alert("Đã gửi yêu cầu tham gia")
            else User chọn KHÔNG JOIN
                 Note over Service: Tiếp tục xử lý như lịch cá nhân
            end
        end

        Note over Service: Kiểm tra trùng lịch (Conflict)
        Service->>Model: calendar.findConflictingAppointment(candidate)
        alt Có lịch trùng
            Service-->>Controller: status: 'CONFLICT'
            Controller-->>Page: status: 'CONFLICT'
            Page-->>User: window.confirm("Trùng lịch. Bạn có muốn thay thế?")
            alt User chọn REPLACE
                Page->>Controller: createAppointment(request, replaceConflict: true)
                Service->>Model: calendar.replaceAppointment(old, new)
                Service-->>Page: status: 'REPLACED'
                Page-->>User: Alert("Đã thay thế cuộc hẹn")
            else User chọn HỦY
                Page-->>User: Đóng thông báo, giữ nguyên lịch cũ
            end
        else Không có lịch trùng
            Service->>Model: calendar.addAppointment(newAppointment)
            Service-->>Controller: status: 'SUCCESS'
            Controller-->>Page: status: 'SUCCESS'
            Page-->>User: Alert("Thêm cuộc hẹn thành công")
        end
    end
    Page->>Page: reloadAppointments()
