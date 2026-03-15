import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto, CreatePortalDto } from './dto/create-checkout.dto';

@Controller()
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * Create a Stripe Checkout session for subscription payment
   */
  @Post('api/billing/checkout')
  @HttpCode(HttpStatus.OK)
  async createCheckout(@Body() dto: CreateCheckoutDto) {
    const baseUrl = process.env.DASHBOARD_URL || 'http://localhost:5173';
    return this.stripeService.createCheckoutSession(
      dto.tenantId,
      dto.planType,
      `${baseUrl}/billing/success`,
      `${baseUrl}/billing/cancelled`,
    );
  }

  /**
   * Create a Stripe Billing Portal session
   */
  @Post('api/billing/portal')
  @HttpCode(HttpStatus.OK)
  async createPortal(@Body() dto: CreatePortalDto) {
    // Get subscription to find stripeCustomerId
    const baseUrl = process.env.DASHBOARD_URL || 'http://localhost:5173';
    // This will need the stripeCustomerId - simplified for now
    return this.stripeService.createBillingPortalSession(
      dto.tenantId, // In production, lookup stripeCustomerId from tenantId
      `${baseUrl}/settings`,
    );
  }

  /**
   * Get invoices for a tenant
   */
  @Get('api/billing/invoices/:tenantId')
  async getInvoices(@Param('tenantId') tenantId: string) {
    // In production, lookup stripeCustomerId from tenantId
    return this.stripeService.getInvoices(tenantId);
  }

  /**
   * Stripe webhook handler (PUBLIC - verified by signature)
   * IMPORTANT: Uses raw body for signature verification
   */
  @Post('api/webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new Error('Raw body not available for webhook verification');
    }
    await this.stripeService.handleWebhook(rawBody, signature);
    return { received: true };
  }
}
