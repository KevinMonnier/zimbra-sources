package com.zimbra.qa.selenium.projects.ajax.tests.tasks;

import java.util.HashMap;
import org.testng.annotations.Test;

import com.zimbra.common.soap.Element;
import com.zimbra.qa.selenium.framework.items.FileItem;
import com.zimbra.qa.selenium.framework.items.FolderItem;
import com.zimbra.qa.selenium.framework.items.MailItem;
import com.zimbra.qa.selenium.framework.items.TaskItem;
import com.zimbra.qa.selenium.framework.items.FolderItem.SystemFolder;
import com.zimbra.qa.selenium.framework.ui.Action;
import com.zimbra.qa.selenium.framework.ui.Button;
import com.zimbra.qa.selenium.framework.ui.Shortcut;
import com.zimbra.qa.selenium.framework.util.GeneralUtility;
import com.zimbra.qa.selenium.framework.util.HarnessException;
import com.zimbra.qa.selenium.framework.util.SleepUtil;
import com.zimbra.qa.selenium.framework.util.ZAssert;
import com.zimbra.qa.selenium.framework.util.ZimbraAccount;
import com.zimbra.qa.selenium.framework.util.ZimbraSeleniumProperties;
import com.zimbra.qa.selenium.projects.ajax.core.AjaxCommonTest;
import com.zimbra.qa.selenium.projects.ajax.ui.DialogWarning;
import com.zimbra.qa.selenium.projects.ajax.ui.tasks.FormTaskNew;
import com.zimbra.qa.selenium.projects.ajax.ui.tasks.FormTaskNew.Field;
import com.zimbra.qa.selenium.projects.ajax.ui.tasks.PageTasks.Locators;

public class CreateTask extends AjaxCommonTest {

	@SuppressWarnings("serial")
	public CreateTask() {
		logger.info("New " + CreateTask.class.getCanonicalName());
		super.startingPage = app.zPageTasks;
		super.startingAccountPreferences = new HashMap<String , String>() {{
			put("zimbraPrefShowSelectionCheckbox", "TRUE");
			put("zimbraPrefComposeFormat", "text");
			put("zimbraPrefGroupMailBy", "message");
			put("zimbraPrefTasksReadingPaneLocation", "bottom");
		}};
	}

	@Test(	description = "Create Simple task through GUI - verify through soap",
			groups = { "sanity" })
			public void CreateTask_01() throws HarnessException {

		String subject = "task" + ZimbraSeleniumProperties.getUniqueString();
		String body = "taskbody"+ ZimbraSeleniumProperties.getUniqueString();

		// Click NEW button
		FormTaskNew taskNew = (FormTaskNew) app.zPageTasks.zToolbarPressButton(Button.B_NEW);

		// Fill out the resulting form
		taskNew.zFillField(Field.Subject, subject);
		taskNew.zFillField(Field.Body, body);
		taskNew.zSubmit();
		SleepUtil.sleepMedium();

		TaskItem task = TaskItem.importFromSOAP(app.zGetActiveAccount(), subject);
		ZAssert.assertEquals(task.getName(), subject, "Verify task subject");
		ZAssert.assertEquals(task.gettaskBody().trim(), body.trim(), "Verify the task body");

	}
	/**
	 * Test Case :Create new task using keyboard shortcut Esc
	 * Open new Task 
	 * Enter Subject and body
	 * Press Escape 'Esc' shortcut 
	 * Waring dialog should pop up and press Yes
	 * Task should show in list 
	 * @throws HarnessException
	 */
	@Test(description = "Create new task using keyboard shortcut Esc- Verify through Soap", groups = { "smoke" })
	public void CreateTask_02() throws HarnessException {

		Shortcut shortcut = Shortcut.S_ESCAPE;
		String subject = "task" + ZimbraSeleniumProperties.getUniqueString();
		String body = "taskbody" + ZimbraSeleniumProperties.getUniqueString();
		
		//Click NEW button
		FormTaskNew taskNew = (FormTaskNew) app.zPageTasks.zToolbarPressButton(Button.B_NEW);
		
		//Fill out resulting form		
		taskNew.zFillField(Field.Subject, subject);
		taskNew.zFillField(Field.Body, body);
				
		//Click Escape shortcut 'Esc'	
		DialogWarning warning =(DialogWarning)app.zPageTasks.zKeyboardShortcut(shortcut);
		ZAssert.assertNotNull(warning, "Verify the dialog is opened");

		//Click Yes button of warning dialog
		warning.zClickButton(Button.B_YES);

		TaskItem task = TaskItem.importFromSOAP(app.zGetActiveAccount(), subject);
		ZAssert.assertEquals(task.getName(), subject, "Verify task subject");
		ZAssert.assertEquals(task.gettaskBody().trim(), body.trim(), "Verify the task body");

	}
	
	@Test(	description = "Create task using New menu pulldown  - verify through SOAP",	groups = { "smoke" })
	public void CreateTask_03() throws HarnessException {

		String subject = "task" + ZimbraSeleniumProperties.getUniqueString();
		String body = "taskbody" + ZimbraSeleniumProperties.getUniqueString();

		// Click NEW drop down and click Task
		FormTaskNew taskNew = (FormTaskNew) app.zPageTasks
				.zToolbarPressPulldown(Button.B_NEW, Button.O_NEW_TASK);

		// Fill out the resulting form
		taskNew.zFillField(Field.Subject, subject);
		taskNew.zFillField(Field.Body, body);
		taskNew.zSubmit();

		TaskItem task = TaskItem.importFromSOAP(app.zGetActiveAccount(),subject);
		ZAssert.assertEquals(task.getName(), subject, "Verify task subject");
		ZAssert.assertEquals(task.gettaskBody().trim(), body.trim(),"Verify the task body");

	}
	/**
	 * Test Case :Create new task using keyboard shortcut NK (New Task)
	 * Open new Task 
	 * Enter Subject and body
	 * Press 'NK' shortcut 
	 * New Task page should get open
	 * Fill required inputs and save it
	 * Task should show in list 
	 * @throws HarnessException
	 */
	@Test(description = "Create new task using keyboard shortcut 'NK'- Verify through Soap", groups = { "smoke" })
	public void CreateTask_04() throws HarnessException {

		Shortcut shortcut = Shortcut.S_NEWTASK;
		String subject = "task" + ZimbraSeleniumProperties.getUniqueString();
		String body = "taskbody" + ZimbraSeleniumProperties.getUniqueString();
		
		//Click NEW Task shortcut "NK"
		FormTaskNew taskNew = (FormTaskNew) app.zPageTasks.zKeyboardShortcut(shortcut);
		
		//Fill out resulting form		
		taskNew.zFillField(Field.Subject, subject);
		taskNew.zFillField(Field.Body, body);
		taskNew.zSubmit();		

		TaskItem task = TaskItem.importFromSOAP(app.zGetActiveAccount(), subject);
		ZAssert.assertEquals(task.getName(), subject, "Verify task subject");
		ZAssert.assertEquals(task.gettaskBody().trim(), body.trim(), "Verify the task body");

	}
	
	@Test(	description = "Create Tasks, using 'Right Click' Mail subject -> 'Create Task'-Verify through Soap",
			groups = { "smoke" })
	public void CreateTask_05() throws HarnessException {
		
		app.zPageMail.zNavigateTo();
		String subject = "subject"+ ZimbraSeleniumProperties.getUniqueString();	

		// Send a message to the account
		ZimbraAccount.AccountA().soapSend(
					"<SendMsgRequest xmlns='urn:zimbraMail'>" +
						"<m>" +
							"<e t='t' a='"+ app.zGetActiveAccount().EmailAddress +"'/>" +
							"<su>"+ subject +"</su>" +
							"<mp ct='text/plain'>" +
								"<content>content"+ ZimbraSeleniumProperties.getUniqueString() +"</content>" +
							"</mp>" +
						"</m>" +
					"</SendMsgRequest>");
		
		// Get the mail item for the new message
		MailItem mail = MailItem.importFromSOAP(app.zGetActiveAccount(), "subject:("+ subject +")");
		
		// Click Get Mail button
		app.zPageMail.zToolbarPressButton(Button.B_GETMAIL);
		
		SleepUtil.sleepMedium();
		
		//Click on subject
		app.zPageMail.zListItem(Action.A_LEFTCLICK, mail.dSubject);
		
		
		//Right click subject >> select Create Task menu item
		app.zPageMail.zListItem(Action.A_RIGHTCLICK, Button.O_CREATE_TASK, mail.dSubject);
		
		//click save
		app.zPageTasks.zToolbarPressButton(Button.B_SAVE);
		
		//Verify task created.
		TaskItem task = TaskItem.importFromSOAP(app.zGetActiveAccount(), subject);
		ZAssert.assertEquals(task.getName(), subject, "Verify task subject");
	}
	
	@Test(	description = "Create Simple task with attachment through RestUtil - verify through GUI",
			groups = { "smoke" })
			public void CreateTask_06() throws HarnessException {

		String subject = "task" + ZimbraSeleniumProperties.getUniqueString();
		
		
		ZimbraAccount account = app.zGetActiveAccount();
		FolderItem taskFolder = FolderItem.importFromSOAP(account,SystemFolder.Tasks);

		// Create file item
		String filePath = ZimbraSeleniumProperties.getBaseDirectory() + "/data/public/Files/Basic01/BasicExcel2007.xlsx";
		// Upload file to server through RestUtil
		String attachmentId = account.uploadFile(filePath);		
		

		app.zGetActiveAccount().soapSend(
				"<CreateTaskRequest xmlns='urn:zimbraMail'>" +
				"<m >" +
				"<inv>" +
				"<comp name='"+ subject +"'>" +
				"<or a='"+ app.zGetActiveAccount().EmailAddress +"'/>" +
				"</comp>" +
				"</inv>" +
				"<su>"+ subject +"</su>" +
				"<mp ct='text/plain'>" +
				"<content>content"+ ZimbraSeleniumProperties.getUniqueString() +"</content>" +
				"</mp>" +
				"<attach aid='"+attachmentId+"'>"+
				"</attach>"+
				"</m>" +
		"</CreateTaskRequest>");

		GeneralUtility.syncDesktopToZcsWithSoap(app.zGetActiveAccount());

		TaskItem task = TaskItem.importFromSOAP(app.zGetActiveAccount(), subject);
		ZAssert.assertNotNull(task, "Verify the task is created");

		// Refresh the tasks view
		app.zTreeTasks.zTreeItem(Action.A_LEFTCLICK, taskFolder);

		// Select the item
		app.zPageTasks.zListItem(Action.A_LEFTCLICK, subject);
		ZAssert.assertTrue(app.zPageTasks.sIsElementPresent(Locators.zAttachmentsLabel),"Verify Attachments: label");
		
	}
	
	@Test(	description = "Create Simple task  with attachment through RestUtil - verify through soap",
			groups = { "smoke" })
			public void CreateTask_07() throws HarnessException {

		String subject = "task" + ZimbraSeleniumProperties.getUniqueString();
		
		
		ZimbraAccount account = app.zGetActiveAccount();
		FolderItem taskFolder = FolderItem.importFromSOAP(account,SystemFolder.Tasks);

		// Create file item
		String filePath = ZimbraSeleniumProperties.getBaseDirectory() + "/data/public/Files/Basic01/BasicExcel2007.xlsx";
		FileItem file = new FileItem(filePath);
		String fileName = file.getName();
		
		// Upload file to server through RestUtil
		String attachmentId = account.uploadFile(filePath);		
		

		app.zGetActiveAccount().soapSend(
				"<CreateTaskRequest xmlns='urn:zimbraMail'>" +
				"<m >" +
				"<inv>" +
				"<comp name='"+ subject +"'>" +
				"<or a='"+ app.zGetActiveAccount().EmailAddress +"'/>" +
				"</comp>" +
				"</inv>" +
				"<su>"+ subject +"</su>" +
				"<mp ct='text/plain'>" +
				"<content>content"+ ZimbraSeleniumProperties.getUniqueString() +"</content>" +
				"</mp>" +
				"<attach aid='"+attachmentId+"'>"+
				"</attach>"+
				"</m>" +
		"</CreateTaskRequest>");

		GeneralUtility.syncDesktopToZcsWithSoap(app.zGetActiveAccount());

		TaskItem task = TaskItem.importFromSOAP(app.zGetActiveAccount(), subject);
		ZAssert.assertNotNull(task, "Verify the task is created");
		
		app.zTreeTasks.zTreeItem(Action.A_LEFTCLICK, taskFolder);		
		account.soapSend("<SearchRequest xmlns='urn:zimbraMail' types='task' >"
				+ "<query>" + subject + "</query>" + "</SearchRequest>");
		
		String invId = account.soapSelectValue("//mail:SearchResponse/mail:task", "invId");
		
		account.soapSend("<GetMsgRequest xmlns='urn:zimbraMail'>"
				+ "<m id='" + invId + "' />" + "</GetMsgRequest>");
		
		Element getMsgResponse = account.soapSelectNode("//mail:GetMsgResponse", 1);
		Element m = ZimbraAccount.SoapClient.selectNode(getMsgResponse,"//mail:mp[@s='9055']");
		ZAssert.assertEquals(m.getAttribute("filename", null), fileName, "Verify file name through SOAP");
				
	}
}
