/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Server
 * Copyright (C) 2011, 2012 VMware, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

package com.zimbra.soap.admin.message;

import com.google.common.base.Objects;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import java.util.Collections;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import com.zimbra.common.soap.AdminConstants;
import com.zimbra.soap.admin.type.IntIdAttr;
import com.zimbra.soap.type.ZmBoolean;

/**
 * @zm-api-command-auth-required true
 * @zm-api-command-admin-auth-required true
 * @zm-api-command-description Checks for items that have no blob, blobs that have no item, and items that have an
 * incorrect blob size stored in their metadata.  If no volumes are specified, all volumes are checked.  If no
 * mailboxes are specified, all mailboxes are checked.  Blob sizes are checked by default.  Set checkSize to 0 (false)
 * to * avoid the CPU overhead of uncompressing compressed blobs in order to calculate size.
 */
@XmlAccessorType(XmlAccessType.NONE)
@XmlRootElement(name=AdminConstants.E_CHECK_BLOB_CONSISTENCY_REQUEST)
public class CheckBlobConsistencyRequest {

    /**
     * @zm-api-field-description Set checkSize to <b>0 (false)</b> to avoid the CPU overhead of uncompressing
     * compressed blobs in order to calculate size.
     */
    @XmlAttribute(name=AdminConstants.A_CHECK_SIZE /* checkSize */, required=false)
    private ZmBoolean checkSize;


    /**
     * @zm-api-field-tag report-used-blobs
     * @zm-api-field-description If set a complete list of all blobs used by the mailbox(es) is returned
     */
    @XmlAttribute(name=AdminConstants.A_REPORT_USED_BLOBS /* reportUsedBlobs */, required=false)
    private ZmBoolean reportUsedBlobs;

    // ShortIdAttr would be a more accurate fit
    /**
     * @zm-api-field-description Volumes
     */
    @XmlElement(name=AdminConstants.E_VOLUME /* volume */, required=false)
    private List<IntIdAttr> volumes = Lists.newArrayList();

    /**
     * @zm-api-field-description Mailboxes
     */
    @XmlElement(name=AdminConstants.E_MAILBOX /* mbox */, required=false)
    private List<IntIdAttr> mailboxes = Lists.newArrayList();

    public CheckBlobConsistencyRequest() {
    }

    public void setCheckSize(Boolean checkSize) { this.checkSize = ZmBoolean.fromBool(checkSize); }
    public void setReportUsedBlobs(Boolean reportUsedBlobs) { this.reportUsedBlobs = ZmBoolean.fromBool(reportUsedBlobs); }
    public void setVolumes(Iterable <IntIdAttr> volumes) {
        this.volumes.clear();
        if (volumes != null) {
            Iterables.addAll(this.volumes, volumes);
        }
    }

    public CheckBlobConsistencyRequest addVolume(IntIdAttr volume) {
        this.volumes.add(volume);
        return this;
    }

    public void setMailboxes(Iterable <IntIdAttr> mailboxes) {
        this.mailboxes.clear();
        if (mailboxes != null) {
            Iterables.addAll(this.mailboxes, mailboxes);
        }
    }

    public CheckBlobConsistencyRequest addMailbox(IntIdAttr mailbox) {
        this.mailboxes.add(mailbox);
        return this;
    }

    public Boolean getCheckSize() { return ZmBoolean.toBool(checkSize); }
    public Boolean getReportUsedBlobs() { return ZmBoolean.toBool(reportUsedBlobs); }
    public List<IntIdAttr> getVolumes() {
        return Collections.unmodifiableList(volumes);
    }
    public List<IntIdAttr> getMailboxes() {
        return Collections.unmodifiableList(mailboxes);
    }

    public Objects.ToStringHelper addToStringInfo(Objects.ToStringHelper helper) {
        return helper
            .add("checkSize", checkSize)
            .add("reportUsedBlobs", reportUsedBlobs)
            .add("volumes", volumes)
            .add("mailboxes", mailboxes);
    }

    @Override
    public String toString() {
        return addToStringInfo(Objects.toStringHelper(this)).toString();
    }
}
