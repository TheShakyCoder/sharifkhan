<?php

namespace App\Http\Middleware;

use App\Models\HttpRequest;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogHttpRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestData = [
            'url'       => $request->fullUrl(),
            'method'    => $request->method(),
            'ip'        => $request->ip(),
            'body'      => json_encode($request->all()),
            'referer'   => $request->headers->get('referer'),
            // Add more details as needed
        ];

        // Use Eloquent to save data to the requests table
        HttpRequest::create($requestData);

        return $next($request);
    }
}
