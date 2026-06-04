# GES VIP CLUB - Development Testing Guide

## Test User Flow (End-to-End)

### Step 1: Home Page
- **URL**: http://localhost:3000
- **Expected**: 
  - Landing page displays with logo
  - Hero section with "Join Now" button
  - 3 membership plans (Basic, Gold, Platinum)
  - Senior Mode toggle button (👴) in header
  - "Join Now" CTA button

### Step 2: Register New Account
- **URL**: http://localhost:3000/register
- **Form Fields**:
  - Full Name: `Test User` or any name
  - Email: `testuser@example.com` (must be unique)
  - Password: `TestPassword123` (min 6 characters)
  - Confirm Password: `TestPassword123`
- **Expected Flow**:
  1. Submit form
  2. Success message displays: "Registration successful! Redirecting to login..."
  3. Auto-redirects to login page after 2 seconds
  4. Check Supabase Auth panel to verify user created

### Step 3: Login with New Account
- **URL**: http://localhost:3000/login
- **Form Fields**:
  - Email: `testuser@example.com`
  - Password: `TestPassword123`
- **Expected Flow**:
  1. Form submits
  2. Success notification (if visible)
  3. Auto-redirects to `/dashboard`
  4. Auth context updates with user data
  5. Header shows "Logout" button instead of Login/Join

### Step 4: Dashboard - Verify Protected Route
- **URL**: http://localhost:3000/dashboard
- **Expected**:
  - Page loads with authenticated user data
  - Shows personalized welcome message
  - All dashboard sections render correctly
  - Header shows "Logout" button
  - Senior Mode button (👴) is visible

### Step 5: Dashboard - Sections Verification

#### 5a. Welcome Section
- Large heading with user name from auth
- Message about GES VIP CLUB account being active

#### 5b. Membership Status Card
- Plan Name: **Gold**
- Price: **$79/month**
- Status: **✓ Active**
- Renewal Date: ~30 days from today
- Days until renewal: Automatically calculated

#### 5c. Properties Section
- **Property 1**: "123 Main Street, Springfield, IL"
  - Type: Residential
  - Created: Jan 02, 2026
- **Property 2**: "456 Oak Avenue, Springfield, IL"
  - Type: Residential
  - Created: Jan 03, 2026
- Click property to select (highlighted with yellow border)

#### 5d. Recent Service Requests
- **Request 1**: "Annual electrical inspection"
  - Status: ✓ Completed (green)
  - Requested: Jan 15, 2026
  - QB Ref: INV-2024-001
- **Request 2**: "Outlet installation"
  - Status: 📅 Scheduled (yellow)
  - Requested: Jan 20, 2026
  - Scheduled: Jan 25, 2026
  - QB Ref: EST-2024-005

#### 5e. Quick Actions
- ⚡ Request Service → Opens modal
- 📅 Schedule Visit
- 🚨 Emergency Service
- 📞 Call: 1-800-GES-CLUB → tel: link

#### 5f. QuickBooks Financial Summary
- Pending Invoices: **1**
- Total Outstanding: **$2,499.99**
- Label: "Managed in QuickBooks"

#### 5g. Support Card
- 24/7 Support Line
- Phone: **1-800-GES-CLUB**

### Step 6: Test Request Service Modal
- **Action**: Click "⚡ Request Service" button
- **Expected**:
  - Modal opens with form
  - Fields: Service Type dropdown, Description, Preferred Date, Emergency checkbox
  - Property address pre-filled from selected property
- **Submit Form**:
  - Service Type: Select any option
  - Description: "Test service request"
  - Preferred Date: Pick any future date
  - Emergency: Leave unchecked
- **Expected Result**:
  - Form submits
  - Success message shows: "✓ Service request submitted successfully!"
  - Modal closes after 2 seconds
  - Form resets

### Step 7: Test Senior Mode on Dashboard
- **Action**: Click "👴" button in header (top right)
- **Expected Changes**:
  - Welcome section expands
  - Dashboard changes to single-column simplified layout
  - 4 large action buttons become prominent
  - Text scales up (base text-lg, headings 5xl+)
  - Button heights increase (py-6, text-2xl)
  - Spacing increases (gap-8 → gap-12)
  - "Need Help" section displays prominently
  - Contact info section shows user email/phone
- **Action**: Click "👴" again
- **Expected**: Layout reverts to regular 3-column dashboard

### Step 8: Test Logout
- **Action**: Click "Logout" button in header
- **Expected**:
  - Auth context clears
  - Header changes to show "Login" and "Join Now" buttons
  - User is logged out from Supabase

### Step 9: Protected Route Check
- **Action**: Try to access `/dashboard` while logged out
- **Expected**: 
  - Automatic redirect to `/login` page
  - Cannot access dashboard without authentication

### Step 10: Forgot Password Flow (Optional)
- **URL**: http://localhost:3000/forgot-password
- **Form Fields**: Email address
- **Expected**:
  - Submits to Supabase
  - Shows success message: "Password reset email sent!"
  - Message about checking spam folder
  - (Email will arrive from Supabase)

---

## Supabase Integration Verification

### Auth Tables Created:
- ✅ `auth.users` - Supabase managed
- ✅ User metadata stored with `full_name`

### Authentication Methods:
- ✅ Email/Password registration
- ✅ Email/Password login
- ✅ Session management
- ✅ Password reset via email

### Mock Data:
- Dashboard uses mock `getDashboardData()` function
- Shows realistic sample user and properties
- Ready for Supabase database table integration

---

## Test Credentials

### Test Account
- **Email**: `testuser@example.com`
- **Password**: `TestPassword123`
- **Full Name**: `Test User`

### Create Additional Test Accounts:
Each registration must use a **unique email address**:
- `dev1@example.com`
- `dev2@example.com`
- `testmember@ges-electric.com`
- etc.

---

## Browser DevTools Checks

### Console Verification:
- No auth errors
- Session loads correctly
- No TypeScript errors
- Network requests succeed

### Local Storage:
- Supabase session token stored
- User data persists on page refresh

### Network Tab:
- Auth requests go to: `tmpolrjddutatfjokjfk.supabase.co`
- Successful responses (200, 201)
- No CORS errors

---

## Build Verification

```bash
# Build production bundle
npm run build

# Expected output:
# ✓ Compiled successfully in XXXms
# ✓ Routes generated: /, /register, /login, /dashboard, /forgot-password
```

---

## Common Test Scenarios

### Scenario 1: New User Registration
1. Visit `/register`
2. Fill form with unique email
3. Click register
4. Wait for redirect to `/login`
5. Login with new credentials
6. Verify dashboard loads

### Scenario 2: Existing User Login
1. Visit `/login`
2. Enter known credentials
3. Verify redirect to `/dashboard`
4. Verify personalized welcome

### Scenario 3: Session Persistence
1. Login to account
2. Refresh browser (F5)
3. Verify still logged in
4. Navigate to dashboard
5. Verify all data persists

### Scenario 4: Protected Route
1. Logout
2. Manually navigate to `/dashboard`
3. Verify redirect to `/login`

### Scenario 5: Senior Mode
1. Login to dashboard
2. Click Senior Mode button
3. Verify layout transformation
4. Test on mobile viewport
5. Click to disable Senior Mode

---

## Known Mock Data

### User Profile:
- Name: John Doe
- Email: member@ges-electric.com
- Phone: (555) 123-4567
- Membership: Gold ($79/month)
- Member Since: Jan 02, 2026
- Renewal: ~30 days from now

### Properties:
- 123 Main Street, Springfield, IL (Residential)
- 456 Oak Avenue, Springfield, IL (Residential)

### Service Requests:
- Annual electrical inspection (Completed, QB: INV-2024-001)
- Outlet installation (Scheduled, QB: EST-2024-005)

### QuickBooks Reference:
- Customer ID: CUST-12345
- Pending Invoices: 1
- Outstanding Balance: $2,499.99

---

## Next Steps for Integration

### When Supabase Tables Ready:
1. Create `profiles` table (user_id, email, full_name, phone, created_at)
2. Create `properties` table (id, user_id, address, type, created_at)
3. Create `service_requests` table (id, property_id, service_type, status, qb_ref_id)
4. Update `getDashboardData()` to fetch from tables instead of mock data
5. Update services to use `supabase.from('table').select()`

### QuickBooks Sync:
1. Store QB customer IDs in profiles
2. Sync last update timestamp
3. Fetch financial data from QB API (not stored in Supabase)
4. Display QB data on dashboard

---

## Troubleshooting

### Issue: "Auth context not found" Error
- **Fix**: Ensure `AuthProvider` wraps all components in `layout.tsx`

### Issue: Blank Dashboard
- **Fix**: Check browser console for auth errors
- **Fix**: Verify Supabase environment variables in `.env.local`

### Issue: Login Not Redirecting
- **Fix**: Check `router.push()` in login handler
- **Fix**: Verify auth context returns user immediately after login

### Issue: Senior Mode Not Changing Layout
- **Fix**: Click button again - may be loading
- **Fix**: Check browser console for errors

### Issue: Modal Not Opening
- **Fix**: Ensure button has `onClick={() => setIsRequestModalOpen(true)}`
- **Fix**: Check modal component is receiving correct props

---

## Manual Testing Checklist

- [ ] Home page loads with logo
- [ ] Register form validates all fields
- [ ] Registration creates user in Supabase
- [ ] Successful registration redirects to login
- [ ] Login accepts credentials and redirects to dashboard
- [ ] Dashboard loads with mock data
- [ ] Welcome message shows user name
- [ ] Properties are clickable and selectable
- [ ] Service requests display with status colors
- [ ] QuickBooks summary shows pending invoices
- [ ] Request Service modal opens
- [ ] Modal form accepts input
- [ ] Modal closes on success
- [ ] Senior Mode toggles layout
- [ ] Senior Mode text scales up
- [ ] Senior Mode buttons enlarge
- [ ] Logout button works
- [ ] Protected route redirects when not logged in
- [ ] Session persists on page refresh
- [ ] Forgot password form submits
- [ ] Build completes without errors

---

## Production Readiness Checklist

- [ ] All auth routes protected
- [ ] All form validations working
- [ ] Error messages display appropriately
- [ ] Loading states show during requests
- [ ] Senior Mode works on all pages
- [ ] Mobile responsive on all views
- [ ] TypeScript compile succeeds
- [ ] No console errors in DevTools
- [ ] Session persists across page refreshes
- [ ] User metadata stored with full name
- [ ] Dashboard mock data looks realistic
- [ ] QuickBooks reference IDs stored correctly
- [ ] All tests pass

