package com.zimbra.qa.selenium.projects.ajax.tests.calendar.meetings.organizer.quickadd;

import java.util.Calendar;
import java.util.HashMap;
import org.testng.annotations.Test;
import com.zimbra.qa.selenium.framework.items.AppointmentItem;
import com.zimbra.qa.selenium.framework.items.MailItem;
import com.zimbra.qa.selenium.framework.util.*;
import com.zimbra.qa.selenium.projects.ajax.core.CalendarWorkWeekTest;
import com.zimbra.qa.selenium.projects.ajax.ui.calendar.FormApptNew;
import com.zimbra.qa.selenium.projects.ajax.ui.calendar.QuickAddAppointment;

public class CreateAllDayMeeting extends CalendarWorkWeekTest {

	public CreateAllDayMeeting() {
		logger.info("New "+ CreateMeeting.class.getCanonicalName());

		// All tests start at the Calendar page
		super.startingPage = app.zPageCalendar;

		// Make sure we are using an account with work week view
		super.startingAccountPreferences = new HashMap<String, String>() {
			private static final long serialVersionUID = -2913827779459595178L;
		{
		    put("zimbraPrefCalendarInitialView", "workWeek");
		}};
	}
	
	@Test(	description = "Create all day meeting invite using quick add dialog",
			groups = { "smoke" }
	)
	public void CreateAllDayMeeting_01() throws HarnessException {
		
		// Create appointment
		AppointmentItem appt1 = new AppointmentItem();
		AppointmentItem appt2 = new AppointmentItem();
		Calendar now = this.calendarWeekDayUTC;
		ZimbraResource location = new ZimbraResource(ZimbraResource.Type.LOCATION);
		
		String apptSubject, apptAttendee, apptLocation, apptContent;
		apptSubject = ZimbraSeleniumProperties.getUniqueString();
		apptAttendee = ZimbraAccount.AccountA().EmailAddress;
		apptLocation = location.EmailAddress;
		apptContent = ZimbraSeleniumProperties.getUniqueString();
		
		appt1.setSubject(apptSubject);
		appt1.setStartTime(new ZDate(now.get(Calendar.YEAR), now.get(Calendar.MONTH) + 1, now.get(Calendar.DAY_OF_MONTH), 12, 0, 0));
		appt1.setEndTime(new ZDate(now.get(Calendar.YEAR), now.get(Calendar.MONTH) + 1, now.get(Calendar.DAY_OF_MONTH), 14, 0, 0));
		appt2.setAttendees(apptAttendee);
		appt1.setLocation(apptLocation);
		appt2.setContent(apptContent);
	
		// Quick add appointment dialog
		QuickAddAppointment quickAddAppt = new QuickAddAppointment(app) ;
		quickAddAppt.zNewAllDayAppointment();
		quickAddAppt.zFill(appt1);
		quickAddAppt.zMoreDetails();
		
		// Add attendees and body from main form
		FormApptNew apptForm = new FormApptNew(app);
		apptForm.zFill(appt2);
		apptForm.zSubmit();
		
		// Verify appointment exists on the server
		AppointmentItem actual = AppointmentItem.importFromSOAP(app.zGetActiveAccount(), "subject:("+ appt1.getSubject() +")", appt1.getStartTime().addDays(-7), appt1.getEndTime().addDays(7));
		ZAssert.assertNotNull(actual, "Verify the new appointment is created");
		ZAssert.assertEquals(actual.getSubject(), appt1.getSubject(), "Subject: Verify the appointment data");
		ZAssert.assertEquals(actual.getAttendees(), apptAttendee, "Attendees: Verify the appointment data");
		ZAssert.assertEquals(actual.getLocation(), apptLocation, "Loction: Verify the appointment data");
		ZAssert.assertEquals(actual.getContent(), appt2.getContent(), "Content: Verify the appointment data");

		// Verify the attendee receives the meeting
		SleepUtil.sleepMedium();
		AppointmentItem received = AppointmentItem.importFromSOAP(ZimbraAccount.AccountA(), "subject:("+ appt1.getSubject() +")", appt1.getStartTime().addDays(-7), appt1.getEndTime().addDays(7));
		ZAssert.assertEquals(received.getSubject(), appt1.getSubject(), "Subject: Verify the appointment data");
		ZAssert.assertEquals(received.getAttendees(), apptAttendee, "Attendees: Verify the appointment data");
		ZAssert.assertEquals(actual.getLocation(), apptLocation, "Loction: Verify the appointment data");
		ZAssert.assertEquals(received.getContent(), appt2.getContent(), "Content: Verify the appointment data");

		// Verify the attendee receives the invitation
		SleepUtil.sleepMedium();
		MailItem invite = MailItem.importFromSOAP(ZimbraAccount.AccountA(), "subject:("+ appt1.getSubject() +")");
		ZAssert.assertNotNull(invite, "Verify the invite is received");
		ZAssert.assertEquals(invite.dSubject, appt1.getSubject(), "Subject: Verify the appointment data");
		
		// Verify location free/busy status shows as psts=AC	
		String locationStatus = app.zGetActiveAccount().soapSelectValue("//mail:at[@a='"+ apptLocation +"']", "ptst");
		ZAssert.assertEquals(locationStatus, "AC", "Verify that the location status shows as 'ACCEPTED'");
	}

}
