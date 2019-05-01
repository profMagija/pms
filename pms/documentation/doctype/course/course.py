# -*- coding: utf-8 -*-
# Copyright (c) 2019, profmagija and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
import frappe.utils.data as fd
from frappe.model.document import Document

BREAKFAST = 'ACT-00001'
LUNCH = 'ACT-00002'
DINNER = 'ACT-00003'

MEALS = [BREAKFAST, LUNCH, DINNER]

class Course(Document):
	def autoname(self):
		self.name = self.program + self.part + self.abcd + self.year

	def validate(self):
	
		if fd.date_diff(self.end_date, self.start_date) < 0:
			frappe.throw(_("End date can't be before start date"))

		self.activities.sort(key=lambda x: x.time_from)

		for act in self.activities:
			act.activity_date = fd.formatdate(act.time_from)

		for i in range(len(self.activities)):
			self.activities[i].idx = i + 1

	@frappe.whitelist()
	def create_meals(self):
		days = fd.date_diff(self.end_date, self.start_date)

		acts = self.activities[:]

		for a in acts:
			if a.activity in MEALS:
				self.activities.remove(a)
				frappe.delete_doc(a.doctype, a.name)

		def cact(name, date, hr, duration=1):
			doc = frappe.new_doc('Course Activity')
			doc.activity = name
			doc.time_from = fd.add_to_date(date, hours=hr, as_string=True, as_datetime=True)
			doc.time_to = fd.add_to_date(date, hours=hr + duration, as_string=True, as_datetime=True)
			doc.color = '#aaaaaa'
			doc.parent = self.name
			doc.parentfield = 'activities'
			self.activities.append(doc)

		cact(LUNCH, self.start_date, 14)

		if days > 0:
			cact(DINNER, self.start_date, 20)
			cact(BREAKFAST, self.end_date, 8.5, 0.5)

		for i in range(1, days):
			date = fd.add_days(self.start_date, i)
			cact(BREAKFAST, date, 9)
			cact(LUNCH, date, 14)
			cact(DINNER, date, 20)

		self.save()

