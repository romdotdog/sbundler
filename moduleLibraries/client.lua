local invoke, emit
local onInvoke, on
local serverScript
do
	local remoteEvent = script.Parent.RemoteEvent
	local remoteFunction = script.Parent.RemoteFunction

	function invoke(event, ...)
		if type(event) ~= "string" then
			error("`event` must be a string")
		end

		return remoteFunction:InvokeServer(event, ...)
	end

	serverScript = remoteFunction:InvokeServer()

	function emit(event, ...)
		if type(event) ~= "string" then
			error("`event` must be a string")
		end

		remoteEvent:FireServer(event, ...)
	end

	local invokeEvents = {}
	function onInvoke(event, f, overwrite) 
		if invokeEvents[event] and not overwrite then
			error("Attempt to overwrite an already existing invoke event. If you wish to overwrite, please pass a third `true` argument to onInvoke")
		end

		invokeEvents[event] = f
	end

	remoteFunction.OnClientInvoke = function(event, ...)
		local f = invokeEvents[event]
		if f then
			return f(...)
		else
			local t = tick()
			repeat 
				if tick() > t + 5 then
					print("Yielded for 5 seconds waiting for RemoteFunction event "..event..", although one never came.")
					break
				end
				f = invokeEvents[event]
				wait()
			until f

			if f then
				return f(...)
			end
		end
	end

	local events = {}
	local eventQueue = {}
	function on(event, f)
		if events[event] then
			table.insert(events[event], f)
		else
			events[event] = {f}
		end

		local q = eventQueue[event]
		if q then
			for i = 1, #q do
				coroutine.wrap(function()
					f(unpack(q[i]))
				end)()
			end
		end
	end

	remoteEvent.OnClientEvent:Connect(function(event, ...)
		local f = events[event]
		if f then
			for i = 1, #f do
				f[i](...)
			end
		else
			if eventQueue[event] then
				table.insert(eventQueue[event], {...})
			else
				eventQueue[event] = {{...}}
			end
		end
	end)
end
