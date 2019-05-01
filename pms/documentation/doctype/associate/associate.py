# -*- coding: utf-8 -*-
# Copyright (c) 2019, profmagija and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Associate(Document):
	def validate(self):
		self.title = " ".join(filter(None, [self.salutation, self.first_name, self.last_name]))
