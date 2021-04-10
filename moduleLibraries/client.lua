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
		end
	end

	local events = {}
	function on(event, f)
		if events[event] then
			table.insert(events[event], f)
		else
			events[event] = {f}
		end
	end

	remoteEvent.OnClientEvent:Connect(function(event, ...)
		local f = events[event]
		if f then
			for i = 1, #f do
				f[i](...)
			end
		end
	end)
end
