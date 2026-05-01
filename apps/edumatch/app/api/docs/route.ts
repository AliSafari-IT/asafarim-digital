import { NextResponse } from "next/server";

/**
 * GET /api/docs
 *
 * Returns OpenAPI/Swagger spec for EduMatch API.
 * This is a minimal spec covering Phase 2 endpoints.
 */
export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "EduMatch API",
      version: "2.0.0",
      description: "EduMatch Phase 2: Inquiry flow, AI responses, and tutor quote pipeline",
    },
    servers: [
      { url: "http://localhost:3005", description: "Local dev" },
    ],
    paths: {
      "/api/inquiries": {
        post: {
          summary: "Create a new inquiry",
          tags: ["Inquiries"],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["subject", "gradeLevel", "description"],
                  properties: {
                    subject: { type: "string", minLength: 2, maxLength: 50 },
                    gradeLevel: { type: "string", enum: ["K12", "UNDERGRAD", "GRAD"] },
                    description: { type: "string", minLength: 20, maxLength: 5000 },
                    attachments: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string" },
                          url: { type: "string" },
                          mime: { type: "string" },
                          sizeBytes: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Inquiry created" },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
          },
        },
        get: {
          summary: "List student inquiries",
          tags: ["Inquiries"],
          security: [{ BearerAuth: [] }],
          responses: {
            "200": { description: "List of inquiries" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/inquiries/{id}": {
        get: {
          summary: "Get inquiry details with AI responses",
          tags: ["Inquiries"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "Inquiry details" },
            "404": { description: "Not found" },
          },
        },
      },
      "/api/inquiries/{id}/ai": {
        get: {
          summary: "Stream AI response (SSE)",
          tags: ["Inquiries", "AI"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "stream", in: "query", schema: { type: "integer", enum: [0, 1] } },
          ],
          responses: {
            "200": { description: "SSE stream", content: { "text/event-stream": {} } },
          },
        },
      },
      "/api/inquiries/{id}/quote-request": {
        post: {
          summary: "Request tutor quotes for an inquiry",
          tags: ["Quote Requests"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    studentLocation: { type: "object", properties: { lat: { type: "number" }, lng: { type: "number" } } },
                    address: { type: "string" },
                    preferOnline: { type: "boolean" },
                    maxDistanceKm: { type: "number" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Quote request created" },
          },
        },
      },
      "/api/quote-requests/{id}/quotes": {
        post: {
          summary: "Tutor submits a quote",
          tags: ["Quotes"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["hourlyRateCents", "estimatedHours"],
                  properties: {
                    hourlyRateCents: { type: "integer" },
                    estimatedHours: { type: "number" },
                    availabilitySlots: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          start: { type: "string", format: "date-time" },
                          end: { type: "string", format: "date-time" },
                          mode: { type: "string", enum: ["ONLINE", "IN_PERSON"] },
                        },
                      },
                    },
                    notes: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Quote submitted" },
          },
        },
        get: {
          summary: "List quotes for a quote request (student)",
          tags: ["Quotes"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "List of quotes" },
          },
        },
      },
      "/api/quotes/{id}/accept": {
        post: {
          summary: "Student accepts a quote",
          tags: ["Quotes"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "Quote accepted, booking created" },
          },
        },
      },
      "/api/quotes/{id}/decline": {
        post: {
          summary: "Student declines a quote",
          tags: ["Quotes"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "Quote declined" },
          },
        },
      },
      "/api/tutors/quote-requests": {
        get: {
          summary: "List available quote requests for tutor",
          tags: ["Quote Requests"],
          security: [{ BearerAuth: [] }],
          responses: {
            "200": { description: "List of quote requests" },
          },
        },
      },
      "/api/student/profile": {
        post: {
          summary: "Create or update student profile",
          tags: ["Profiles"],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    gradeLevel: { type: "string", enum: ["K12", "UNDERGRAD", "GRAD"] },
                    subjectsOfInterest: { type: "array", items: { type: "string" } },
                    homeAddress: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Profile created/updated" },
          },
        },
        get: {
          summary: "Get student profile",
          tags: ["Profiles"],
          security: [{ BearerAuth: [] }],
          responses: {
            "200": { description: "Student profile" },
          },
        },
      },
      "/api/tutor/profile": {
        post: {
          summary: "Create or update tutor profile",
          tags: ["Profiles"],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    bio: { type: "string" },
                    subjectsTaught: { type: "array", items: { type: "string" } },
                    levelsTaught: { type: "array", items: { type: "string" } },
                    hourlyRateCents: { type: "integer" },
                    onlineOnly: { type: "boolean" },
                    serviceRadiusKm: { type: "integer" },
                    homeAddress: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Profile created/updated" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  };

  return NextResponse.json(spec);
}
