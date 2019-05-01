# -*- coding: utf-8 -*-
# Copyright (c) 2019, profmagija and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class School(Document):
	def validate(self):
		self.title = self.school_name + ", " + self.city + ", " + self.country
