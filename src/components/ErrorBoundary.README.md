# ErrorBoundary Component

A React Error Boundary component that catches JavaScript errors anywhere in the child component tree, logs those errors, and displays a fallback UI instead of crashing the entire application.

## Features

- **Error Catching**: Catches React errors in child components
- **Fallback UI**: Displays a user-friendly error message with recovery options
- **Development Logging**: Logs detailed error information to console in development mode
- **Recovery Actions**: 
  - Reload Page: Refreshes the entire page
  - Try Again: Resets the error boundary state to retry rendering
- **Custom Fallback**: Supports custom fallback UI via props
- **Component Stack**: Shows component stack trace in development mode

## Usage

### Basic Usage

Wrap any component or section of your app with ErrorBoundary:

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### With Custom Fallback

Provide a custom fallback UI:

```tsx
<ErrorBoundary 
  fallback={
    <div>
      <h1>Oops! Something went wrong</h1>
      <button onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

### Nested Error Boundaries

Use multiple error boundaries to isolate errors to specific sections:

```tsx
<ErrorBoundary>
  <Header />
  
  <ErrorBoundary>
    <MainContent />
  </ErrorBoundary>
  
  <ErrorBoundary>
    <Sidebar />
  </ErrorBoundary>
  
  <Footer />
</ErrorBoundary>
```

This way, if MainContent crashes, the Header, Sidebar, and Footer will still work.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | The components to wrap and protect |
| `fallback` | `ReactNode` | No | Custom fallback UI to display on error |

## Default Fallback UI

The default fallback UI includes:

- Alert icon with error indication
- "Something went wrong" heading
- User-friendly error message
- Error details (development mode only):
  - Error message
  - Component stack trace (expandable)
- Recovery actions:
  - **Reload Page**: Refreshes the entire page
  - **Try Again**: Resets error state and attempts to re-render

## Error Logging

In development mode (`import.meta.env.DEV`), the ErrorBoundary logs:

- Error object
- Error info with component stack
- Component stack trace

This information is logged to the browser console for debugging.

## When to Use

Use ErrorBoundary to wrap:

1. **Entire Application**: Catch all errors at the root level
2. **Route Components**: Isolate errors to specific pages
3. **Complex Components**: Protect critical sections like dashboards
4. **Third-party Components**: Isolate errors from external libraries
5. **Dynamic Content**: Protect areas with user-generated or API content

## What ErrorBoundary Catches

Error boundaries catch errors during:

- Rendering
- Lifecycle methods
- Constructors of child components

## What ErrorBoundary Does NOT Catch

Error boundaries do NOT catch errors:

- In event handlers (use try-catch)
- In asynchronous code (use try-catch or .catch())
- During server-side rendering
- In the error boundary itself

## Example: Protecting Routes

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<Routes>
  <Route 
    path="/" 
    element={
      <ErrorBoundary>
        <HomePage />
      </ErrorBoundary>
    } 
  />
  <Route 
    path="/admin" 
    element={
      <ErrorBoundary>
        <AdminDashboard />
      </ErrorBoundary>
    } 
  />
</Routes>
```

## Example: Protecting Admin Sections

```tsx
<AdminLayout>
  <ErrorBoundary>
    <AdminHeader />
  </ErrorBoundary>
  
  <div className="flex">
    <ErrorBoundary>
      <AdminSidebar />
    </ErrorBoundary>
    
    <ErrorBoundary>
      <AdminContent />
    </ErrorBoundary>
  </div>
</AdminLayout>
```

## Testing Error Boundaries

To test the ErrorBoundary in development:

1. Create a component that throws an error:

```tsx
function BrokenComponent() {
  throw new Error('Test error!');
  return <div>This will never render</div>;
}
```

2. Wrap it with ErrorBoundary:

```tsx
<ErrorBoundary>
  <BrokenComponent />
</ErrorBoundary>
```

3. The ErrorBoundary should catch the error and display the fallback UI.

## Best Practices

1. **Multiple Boundaries**: Use multiple error boundaries to isolate errors
2. **Granular Protection**: Wrap individual features rather than the entire app
3. **Custom Fallbacks**: Provide context-specific fallback UI when needed
4. **Error Reporting**: Consider integrating error reporting services (Sentry, etc.)
5. **User Communication**: Provide clear recovery instructions
6. **Graceful Degradation**: Keep critical UI (navigation, logout) outside error-prone sections

## Styling

The default fallback UI uses:

- Tailwind CSS utility classes
- Theme-aware colors (light/dark mode)
- Shadcn UI Button component
- Lucide React icons (AlertTriangle, RefreshCw)

The fallback is fully responsive and accessible.

## Accessibility

The ErrorBoundary fallback UI includes:

- Semantic HTML structure
- Clear error messaging
- Keyboard-accessible buttons
- Sufficient color contrast
- Screen reader friendly content

## Browser Support

Works in all modern browsers that support:

- React 16.8+ (Error Boundaries)
- ES6+ features
- CSS Grid and Flexbox
