# Phân tích Class Diagram
Dựa trên hình ảnh biểu đồ lớp, hệ thống bao gồm các class sau:

## 1. Class: Calendar
**Attributes:**
- `int calendarId`
- `List<Appointment> appointments`

**Methods:**
+ `Appointment findConflictingAppointment(DateTime start, DateTime end)`
+ `GroupMeeting findMatchingGroupMeeting(String title, Duration duration)`
+ `Appointment createAppointment(String title, String location, DateTime start, DateTime end)`
+ `void addAppointment(Appointment appt)`
+ `void replaceAppointment(Appointment oldAppt, Appointment newAppt)`
+ `void joinGroupMeeting(User user, GroupMeeting meeting)`

## 2. Class: Appointment
**Attributes:**
- `int appointmentId`
- `String title`
- `String location`
- `DateTime startTime`
- `DateTime endTime`
- `List<Reminder> reminders`

**Methods:**
+ `Duration getDuration()`
+ `boolean overlapsWith(Appointment other)`
+ `void addReminder(Reminder reminder)`

## 3. Class: GroupMeeting
**Attributes:**
- `List<User> participants`

**Methods:**
+ `boolean hasSameTitleAndDuration(String title, Duration duration)`
+ `void addParticipant(User user)`

## 4. Class: Reminder
**Attributes:**
- `int reminderId`
- `DateTime remindAt`
- `String method`

**Methods:**
+ `String getReminderInfo()`

## 5. Class: User
**Attributes:**
- `int userId`
- `String fullName`

**Methods:**
+ `boolean chooseReplace()`
+ `boolean confirmJoinGroupMeeting()`

## 6. Class: AddAppointmentForm (Đại diện cho giao diện UI)
**Attributes:**
- `DateTime selectedDateTime`
- `String inputTitle`
- `String inputLocation`
- `DateTime inputStartTime`
- `DateTime inputEndTime`
- `List<Reminder> selectedReminders`

**Methods:**
+ `void openFor(DateTime dateTime)`
+ `boolean validateInput()`
+ `void submit()`
+ `void showInvalidInputError(String message)`
+ `void showConflictWarning(Appointment appt)`
+ `boolean askReplace()`
+ `boolean askJoinGroupMeeting(GroupMeeting meeting)`
+ `void showSuccess(String message)`

## Quan hệ Kế thừa (Inheritance):
- `GroupMeeting` kế thừa (extends/inherits) từ `Appointment`. (Mũi tên hình tam giác rỗng chỉ từ GroupMeeting lên Appointment).
